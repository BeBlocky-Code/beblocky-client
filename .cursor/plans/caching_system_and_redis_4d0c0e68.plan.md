---
name: Caching system and Redis
overview: Add a client-side caching layer with TanStack Query (queries + mutations with invalidation) to avoid redundant API calls on navigation and refresh, plus recommendations for Redis-like server-side caching.
todos:
  - id: todo-1769849664981-2jqwkrcsf
    content: Let the server side for the api don't do it on this app
    status: pending
  - id: todo-1769849715193-f2p3fhk65
    content: "Add a guide to refer so that future call and fetches can have this cache system implemented "
    status: pending
isProject: false
---

# Caching System and Redis-Like Product Plan

## Current state

- The app is a **Next.js frontend** that calls an **external API** (`NEXT_PUBLIC_API_URL` / [https://api.beblocky.com](https://api.beblocky.com)). There are **no API routes in this repo**; all `fetch` calls go from the browser to that backend.
- **Heavy reads**: [app/courses/[courseId]/learn/user/[email]/page.tsx](app/courses/[courseId]/learn/user/[email]/page.tsx) runs a large `useEffect` on load that calls `getCourseWithContent(courseId)` (which does 1 course + N lessons + N×slides requests), `userApi.getByEmail`, `studentApi.getByEmail`, and `progressApi.getByStudentAndCourse`. [components/ide/ide-ai-assistant.tsx](components/ide/ide-ai-assistant.tsx) calls `aiConversationApi.getByStudent` and `codeAnalysisApi.getByStudent` on mount. [components/ide/ide-workspace.tsx](components/ide/ide-workspace.tsx) calls `progressApi.getByStudentAndCourse`.
- **Mutations** (progress, student, AI) are in the same page/component and do not currently invalidate any cache, so refetches are manual or on next full load.

To avoid calling the API on every refresh and every navigation, you need **two layers**:

1. **Client-side cache (in this app)** – cache and dedupe requests in the browser, invalidate on mutations. This is what stops redundant calls on tab switch, back/forward, and (with persistence) on page refresh.
2. **Server-side cache (Redis-like, on your backend)** – optional; sits in front of your API to reduce load and latency. It is **not** in this Next.js repo unless you add API routes that proxy to the backend.

---

## Part 1: Client-side caching (this codebase)

**Recommendation: TanStack Query (React Query) v5**

- Industry standard for React data fetching: queries (cache, dedupe, stale-while-revalidate) and mutations (with invalidation or optimistic updates).
- No Redis or server needed; runs entirely in the browser.
- Optional **persistence** (e.g. `localStorage`) so that after a full page refresh the cache is reused and you avoid hitting the API until data is stale.

### 1.1 Install and provider

- Add `@tanstack/react-query` (v5). Optionally add `@tanstack/react-query-persist-client` and `@tanstack/query-sync-storage-persister` for persistence across refresh.
- Create a **QueryClient** with sensible defaults (see below) and wrap the app (or the learn layout) in **QueryClientProvider** in [app/layout.tsx](app/layout.tsx) or [app/courses/[courseId]/learn/user/[email]/page.tsx](app/courses/[courseId]/learn/user/[email]/page.tsx) parent layout.

Suggested defaults:

- **staleTime**: 2–5 minutes for course/content; 30–60 seconds for progress/conversations so mutations feel reflected soon.
- **gcTime** (formerly cacheTime): e.g. 10–30 minutes so unused data is kept for back-navigation.
- **refetchOnWindowFocus**: `true` or `false` depending on whether you want fresh data when the user returns to the tab.
- **retry**: 1–2 with exponential backoff for failed requests.

### 1.2 Query keys (best practice: hierarchical and consistent)

Define a small **query key factory** (e.g. in `lib/query-keys.ts` or inside a query module):

- `courses.detail(courseId)` → course by id
- `courses.withContent(courseId)` → result of `getCourseWithContent(courseId)`
- `users.byEmail(email)`
- `students.byEmail(email)`
- `progress.byStudentAndCourse(studentId, courseId)`
- `progress.byStudent(studentId)`
- `ai.conversations(studentId)`
- `ai.analysisHistory(studentId)`

Use these keys everywhere so invalidation is consistent.

### 1.3 Replace raw fetch with queries

- **Learn page**: Replace the big `useEffect` that fetches course + user + student + progress with:
  - `useQuery({ queryKey: ['courses', 'withContent', courseId], queryFn: () => getCourseWithContent(courseId), staleTime: 5 * 60 * 1000 })`
  - `useQuery({ queryKey: ['users', 'byEmail', email], queryFn: () => userApi.getByEmail(email), enabled: !!email })`
  - `useQuery` for student by email and `useQuery` for `progressApi.getByStudentAndCourse(studentId, courseId)` (enabled when you have `studentId` and `courseId`).
    Derive initial UI state (current lesson, slide, code) from the query data instead of duplicating it in local state where it’s redundant; keep local state only for truly local UI (e.g. current slide index, editor content that can be saved).
- **ide-ai-assistant**: Replace `loadConversations()` / `loadAnalysisHistory()` with:
  - `useQuery({ queryKey: ['ai', 'conversations', studentId], queryFn: () => aiConversationApi.getByStudent(studentId), staleTime: 60 * 1000 })`
  - `useQuery({ queryKey: ['ai', 'analysisHistory', studentId], queryFn: () => codeAnalysisApi.getByStudent(studentId), staleTime: 60 * 1000 })`
- **ide-workspace**: Use `useQuery` for `progressApi.getByStudentAndCourse` with the same key as on the learn page so the same cache entry is shared.

All of these should use the **query key factory** so keys are consistent (e.g. `queryKeys.courses.withContent(courseId)`).

### 1.4 Mutations and invalidation

- For each **write** (e.g. `progressApi.saveCode`, `progressApi.updateTimeSpent`, `progressApi.create`, `aiConversationApi.sendMessage`, `codeAnalysisApi.analyze`), use **useMutation**.
- In `onSuccess` (or in the mutation’s `meta` and a global `onSuccess`), **invalidate** the queries that are now stale:
  - After `progressApi.saveCode` / `updateTimeSpent` / `create` / `completeLesson`: invalidate `progress.byStudentAndCourse(studentId, courseId)` and optionally `progress.byStudent(studentId)`.
  - After `aiConversationApi.create` or `sendMessage`: invalidate `ai.conversations(studentId)`.
  - After `codeAnalysisApi.analyze`: invalidate `ai.analysisHistory(studentId)` and optionally the current analysis query if you have one.

Optionally use **optimistic updates** (update cache in `onMutate`, rollback in `onError`) for progress or conversation list so the UI updates before the server responds.

### 1.5 Optional: persist cache across refresh

- Use `createSyncStoragePersister` (e.g. with `localStorage`) and `persistQueryClient` from `@tanstack/react-query-persist-client` and `@tanstack/query-sync-storage-persister`.
- Persist only the query client for selected keys (e.g. course content, user, student, progress) and set a **maxAge** (e.g. 30 minutes) so old data is dropped. This way a full page refresh will still avoid calling the API until the persisted cache is stale or expired.

### 1.6 Files to add or change

- New: `lib/query-client.ts` (or similar) – create QueryClient, optional persister.
- New: `lib/query-keys.ts` – query key factory.
- Optional: `lib/api/cached-api.ts` or hooks like `useCourseWithContent`, `useProgress`, etc. that wrap `useQuery`/`useMutation` and use the key factory.
- Modify: [app/layout.tsx](app/layout.tsx) – wrap with `QueryClientProvider`.
- Modify: [app/courses/[courseId]/learn/user/[email]/page.tsx](app/courses/[courseId]/learn/user/[email]/page.tsx) – replace the initial data-fetch effect with the above queries and wire mutations with invalidation.
- Modify: [components/ide/ide-ai-assistant.tsx](components/ide/ide-ai-assistant.tsx) – use queries for conversations and analysis history; use mutations for send message and analyze, with invalidation.
- Modify: [components/ide/ide-workspace.tsx](components/ide/ide-workspace.tsx) – use shared progress query.

This gives you a **single, consistent client cache with mutation-aware invalidation** and best practices (keys, stale time, optional persistence) so you avoid calling the API on every refresh and on every navigation.

---

## Part 2: Redis-like product (server-side)

Use a **server-side cache** only when you control (or proxy) the API. It does **not** live in this Next.js app; it sits in front of your backend API (or inside Next.js API routes if you add them later).

**Suggested products:**

| Product                            | Best for                                     | Notes                                                                                                                             |
| ---------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Upstash Redis**                  | Serverless, Vercel/Edge, serverless backends | HTTP REST API, no long-lived connections, pay-per-request, Redis-compatible. Easiest if you’re on Vercel or a serverless backend. |
| **Vercel KV**                      | Next.js on Vercel                            | Built on Upstash; same benefits, tight Vercel integration. Use from Next.js API routes or server components if you add them.      |
| **Redis Cloud / Redis Enterprise** | Self-hosted or VM backends                   | Full Redis; use when you have a long-running backend (Node, Go, etc.) and want a classic Redis setup.                             |
| **Momento**                        | Serverless, multi-cloud                      | Redis-compatible API, serverless cache; alternative to Upstash if you prefer a different vendor.                                  |

**Recommendation:** If your backend is **serverless or you deploy on Vercel**, use **Upstash Redis** or **Vercel KV**: add a cache layer in your backend (or in Next.js API routes that proxy to the current API). On each request to a given resource (e.g. course by id, progress by student+course), check the cache first; on miss, call the real API, store in Redis with a TTL (e.g. 5–10 minutes for course content, 1–2 minutes for progress), then return. Invalidate or overwrite cache entries when mutations occur (e.g. after PATCH progress, delete or update the `progress:studentId:courseId` key).

If your backend is **a long-running server** (Node, Go, etc.), use **Redis Cloud** or a self-hosted Redis instance and the same pattern: check cache → on miss hit DB/API → set with TTL; invalidate on mutations.

**Summary:** The **client-side TanStack Query cache** is what avoids calling the API on each refresh and navigation from the app. The **Redis-like cache** is for reducing load and latency on the **server side**; add it when you have (or add) a backend or proxy that can read/write the cache.

---

## Implementation order (client-side only)

1. Add TanStack Query and (optional) persist packages; create QueryClient and optional persister; add QueryClientProvider in layout.
2. Add query key factory (`lib/query-keys.ts`).
3. Learn page: replace initial fetch effect with `useQuery` for course, user, student, progress; wire save/time/progress mutations with `useMutation` and invalidate the progress query keys.
4. ide-ai-assistant: replace loadConversations/loadAnalysisHistory with queries; wire send message and analyze with mutations and invalidation.
5. ide-workspace: use the same progress query key so one shared cache entry is used.
6. (Optional) Enable persistence with `localStorage` and a short maxAge for selected query keys.

No changes to the external API or Redis are required for the client-side caching; add Redis (or Upstash/Vercel KV) only when you implement or modify the backend.
