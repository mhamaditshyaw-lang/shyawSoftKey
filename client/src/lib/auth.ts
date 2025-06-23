export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function setAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
}

export async function authenticatedRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const token = getAuthToken();
  
  const response = await fetch(url, {
    method,
    headers: token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : {
          "Content-Type": "application/json",
        },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Token is invalid, clear it and redirect to login
      localStorage.removeItem("token");
      window.location.reload();
      throw new Error("Authentication failed. Please log in again.");
    }
    const text = (await response.text()) || response.statusText;
    throw new Error(`${response.status}: ${text}`);
  }

  return response;
}
