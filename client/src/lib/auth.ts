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

export async function authenticatedRequest(method: string, url: string, body?: any) {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    console.error('No authentication token found');
    throw new Error('No authentication token found');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`Making ${method} request to ${url}`, { hasBody: !!body });

  try {
    const response = await fetch(url, options);

    console.log(`Response from ${url}:`, { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    if (response.status === 401) {
      console.error('Authentication failed, removing token');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }

    return response;
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
}