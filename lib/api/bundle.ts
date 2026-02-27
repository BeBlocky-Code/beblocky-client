const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface BundleCourse {
  _id: string;
  courseTitle?: string;
  courseDescription?: string;
}

export interface BundleResponse {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  courseIds: BundleCourse[] | string[];
  projectIds?: string[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchBundles(
  publishedOnly = true
): Promise<BundleResponse[]> {
  if (!API_BASE_URL) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/bundles`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) return [];
    const list = (await res.json()) as BundleResponse[];
    if (publishedOnly) {
      return list.filter((b) => b.isPublished);
    }
    return list;
  } catch {
    return [];
  }
}

export async function fetchBundle(id: string): Promise<BundleResponse | null> {
  if (!API_BASE_URL) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/bundles/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) return null;
    return (await res.json()) as BundleResponse;
  } catch {
    return null;
  }
}
