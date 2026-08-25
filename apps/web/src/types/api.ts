export interface SystemHealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface SystemReadinessResponse {
  status: 'ready' | 'degraded' | 'unhealthy';
  checks: {
    database: string;
    redis: string;
  };
  timestamp: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    request_id?: string;
    details?: Record<string, any>;
  };
}
