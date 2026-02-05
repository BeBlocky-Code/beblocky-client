# BeBlocky Caching System Guide

This guide explains how to use the TanStack Query caching system implemented in the BeBlocky frontend. Following these patterns ensures consistent cache behavior, prevents redundant API calls, and provides a better user experience.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Query Keys](#query-keys)
4. [Using Queries](#using-queries)
5. [Using Mutations](#using-mutations)
6. [Custom Hooks](#custom-hooks)
7. [Cache Invalidation](#cache-invalidation)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The caching system is built on [TanStack Query v5](https://tanstack.com/query/latest) (formerly React Query). It provides:

- **Automatic caching**: Data is cached in memory and reused across components
- **Deduplication**: Multiple components requesting the same data trigger only one API call
- **Background refetching**: Stale data is updated in the background
- **Automatic invalidation**: Mutations automatically refresh related data

### Key Files

| File | Purpose |
|------|---------|
| `lib/query-client.ts` | QueryClient configuration with default settings |
| `lib/query-keys.ts` | Centralized query key factory |
| `lib/hooks/index.ts` | Pre-built hooks for common data fetching |
| `components/providers/query-provider.tsx` | Provider component wrapping the app |

---

## Quick Start

### Using Pre-built Hooks

The easiest way to fetch data is using the pre-built hooks:

```tsx
import { useCourses, useStudentProgress, useUser } from '@/lib/hooks';

function MyComponent() {
  // Fetch all courses
  const { data: courses, isLoading, error } = useCourses();
  
  // Fetch user by ID
  const { data: user } = useUser(userId);
  
  // Fetch student progress
  const { data: progress } = useStudentProgress(studentId);
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <div>{/* Use your data */}</div>;
}
```

### Using Mutations

For data modifications, use mutation hooks:

```tsx
import { useEnrollInCourse, useUpdateProgress } from '@/lib/hooks';

function EnrollButton({ studentId, courseId }) {
  const enrollMutation = useEnrollInCourse();
  
  const handleEnroll = () => {
    enrollMutation.mutate(
      { studentId, courseId },
      {
        onSuccess: () => {
          toast.success('Successfully enrolled!');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };
  
  return (
    <Button 
      onClick={handleEnroll} 
      disabled={enrollMutation.isPending}
    >
      {enrollMutation.isPending ? 'Enrolling...' : 'Enroll'}
    </Button>
  );
}
```

---

## Query Keys

Query keys are the foundation of the caching system. They uniquely identify each piece of cached data.

### Using the Query Key Factory

Always use the centralized query key factory from `lib/query-keys.ts`:

```tsx
import { queryKeys } from '@/lib/query-keys';

// Examples:
queryKeys.courses.all                        // ['courses']
queryKeys.courses.detail('123')              // ['courses', 'detail', '123']
queryKeys.progress.byStudent('456')          // ['progress', 'byStudent', '456']
queryKeys.progress.byStudentAndCourse('456', '123')  // ['progress', 'byStudentAndCourse', '456', '123']
```

### Adding New Query Keys

When adding new API endpoints, extend the query key factory:

```tsx
// In lib/query-keys.ts
export const queryKeys = {
  // ... existing keys
  
  newEntity: {
    all: ['newEntity'] as const,
    lists: () => [...queryKeys.newEntity.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.newEntity.all, 'detail', id] as const,
    byCustomField: (value: string) => [...queryKeys.newEntity.all, 'byField', value] as const,
  },
};
```

---

## Using Queries

### Basic Query Pattern

```tsx
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { myApi } from '@/lib/api/my-api';

function useMyData(id: string) {
  return useQuery({
    queryKey: queryKeys.myEntity.detail(id),
    queryFn: () => myApi.getById(id),
    enabled: !!id, // Only run when id exists
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });
}
```

### Query Options Explained

| Option | Description | Recommended Value |
|--------|-------------|-------------------|
| `staleTime` | How long data is considered fresh | 30s-5min depending on data volatility |
| `gcTime` | How long unused data stays in cache | 10-30 minutes |
| `enabled` | Whether the query should run | Use for conditional fetching |
| `retry` | Number of retry attempts | 2 for most queries |
| `refetchOnWindowFocus` | Refetch when tab is focused | `true` for real-time data |

### Conditional Queries

```tsx
// Only fetch when dependencies are available
const { data: progress } = useStudentCourseProgress(
  studentId,
  courseId,
  !!studentId && !!courseId // enabled condition
);
```

---

## Using Mutations

### Basic Mutation Pattern

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { myApi } from '@/lib/api/my-api';

function useCreateMyEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDto) => myApi.create(data),
    onSuccess: (newEntity) => {
      // Invalidate related queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.myEntity.all,
      });
    },
  });
}
```

### Mutation Callbacks

```tsx
const mutation = useMutation({
  mutationFn: (data) => api.update(data),
  onMutate: async (newData) => {
    // Called before mutation - good for optimistic updates
    await queryClient.cancelQueries({ queryKey: ['myData'] });
    const previous = queryClient.getQueryData(['myData']);
    queryClient.setQueryData(['myData'], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['myData'], context.previous);
  },
  onSuccess: () => {
    // Invalidate to get fresh data
    queryClient.invalidateQueries({ queryKey: ['myData'] });
  },
  onSettled: () => {
    // Always runs after success or error
  },
});
```

---

## Custom Hooks

### Creating a New Query Hook

```tsx
// lib/hooks/use-my-entity.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { myEntityApi } from '@/lib/api/my-entity';

/**
 * Hook to fetch my entity by ID
 */
export function useMyEntity(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.myEntity.detail(id || ''),
    queryFn: () => myEntityApi.getById(id!),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for updating my entity
 */
export function useUpdateMyEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDto }) =>
      myEntityApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.myEntity.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myEntity.all,
      });
    },
  });
}
```

### Export from Index

```tsx
// lib/hooks/index.ts
export {
  useMyEntity,
  useUpdateMyEntity,
} from './use-my-entity';
```

---

## Cache Invalidation

### Invalidation Strategies

**1. Invalidate specific query:**
```tsx
queryClient.invalidateQueries({
  queryKey: queryKeys.courses.detail(courseId),
});
```

**2. Invalidate all queries for an entity:**
```tsx
queryClient.invalidateQueries({
  queryKey: queryKeys.courses.all,
});
```

**3. Invalidate with predicate:**
```tsx
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'courses' && query.queryKey[2] === courseId,
});
```

**4. Direct cache update (optimistic):**
```tsx
queryClient.setQueryData(
  queryKeys.courses.detail(courseId),
  (old) => ({ ...old, ...newData })
);
```

### When to Invalidate

| Action | What to Invalidate |
|--------|-------------------|
| Create entity | Entity list queries |
| Update entity | Specific entity + related lists |
| Delete entity | Entity list + specific entity |
| Update progress | Student progress + course progress |

---

## Best Practices

### 1. Always Use Query Keys Factory

```tsx
// ✅ Good
queryKey: queryKeys.courses.detail(courseId)

// ❌ Bad
queryKey: ['courses', courseId]
```

### 2. Handle Loading and Error States

```tsx
const { data, isLoading, isError, error } = useQuery(...);

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
return <DataView data={data} />;
```

### 3. Use Appropriate Stale Times

```tsx
// Static content (courses, lessons) - longer stale time
staleTime: 5 * 60 * 1000, // 5 minutes

// Dynamic content (progress, conversations) - shorter stale time
staleTime: 30 * 1000, // 30 seconds
```

### 4. Avoid Unnecessary Refetches

```tsx
// Only fetch when needed
enabled: !!studentId && !!courseId,

// Don't refetch on mount if fresh
refetchOnMount: false,
```

### 5. Use Mutations for Side Effects

```tsx
// ✅ Good - mutation with automatic cache update
const mutation = useEnrollInCourse();
mutation.mutate({ studentId, courseId });

// ❌ Bad - manual fetch after mutation
await api.enroll(studentId, courseId);
await refetch(); // Don't do this
```

---

## Troubleshooting

### Data Not Updating

1. Check if invalidation is happening:
```tsx
onSuccess: () => {
  console.log('Invalidating...');
  queryClient.invalidateQueries({ queryKey: ... });
}
```

2. Verify query keys match exactly
3. Check if `enabled` condition is correct

### Too Many API Calls

1. Increase `staleTime` for stable data
2. Check for duplicate query keys in components
3. Use React Query Devtools to inspect queries

### Stale Data Showing

1. Decrease `staleTime` for volatile data
2. Manually invalidate after mutations
3. Use `refetchOnWindowFocus: true`

### Using React Query Devtools

In development, the devtools panel appears at the bottom-left of the screen. Use it to:

- View all active queries and their state
- Manually invalidate or refetch queries
- Inspect cache contents
- See query timing and status

---

## Migration Guide

When converting existing `useEffect` + `useState` patterns:

### Before

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.getData(id)
    .then(setData)
    .finally(() => setLoading(false));
}, [id]);
```

### After

```tsx
const { data, isLoading } = useQuery({
  queryKey: queryKeys.myData.detail(id),
  queryFn: () => api.getData(id),
  enabled: !!id,
});
```

Benefits:
- Automatic caching and deduplication
- Better loading/error states
- Automatic refetching
- Shared cache across components
