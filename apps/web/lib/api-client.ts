export interface ApiClientOptions extends RequestInit {
  token?: string;
  tenantId?: string;
}

export class ApiError extends Error {
  public status: number;
  public details: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { token, tenantId, headers, ...customConfig } = options;

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (tenantId) {
    reqHeaders["X-Organization-ID"] = tenantId;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...customConfig,
    headers: reqHeaders,
  });

  if (!response.ok) {
    let errorPayload: any = {};
    try {
      errorPayload = await response.json();
    } catch {
      // ignore non-json error responses
    }
    throw new ApiError(
      response.status,
      errorPayload.message || errorPayload.detail || `API error (${response.status})`,
      errorPayload
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
