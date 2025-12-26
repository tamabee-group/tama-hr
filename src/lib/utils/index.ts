// Client-side fetch utilities
export {
  apiClient,
  ApiError as ClientApiError,
  type FetchOptions,
  type ApiResponse,
} from "./fetch-client";

// Server-side fetch utilities
export {
  apiServer,
  ApiError as ServerApiError,
  type FetchServerOptions,
} from "./fetch-server";
