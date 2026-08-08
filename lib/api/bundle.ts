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
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured");
  }

  const res = await fetch(`${API_BASE_URL}/bundles`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch bundles: ${res.status}`);
  }
  const list = (await res.json()) as BundleResponse[];
  if (publishedOnly) {
    return list.filter((b) => b.isPublished);
  }
  return list;
}

export async function fetchBundle(id: string): Promise<BundleResponse | null> {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured");
  }

  const res = await fetch(`${API_BASE_URL}/bundles/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch bundle: ${res.status}`);
  }
  return (await res.json()) as BundleResponse;
}
