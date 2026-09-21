import "server-only";
import { unstable_rethrow } from "next/navigation";
import {
  createServerApiClient as createServerTransport,
  type ServerApiContext,
  type BackendService,
} from "./server-client";

export type { ServerApiContext, BackendService } from "./server-client";

/** Next-aware factory: no-store and navigation signals must reach the framework. */
export function createServerApiClient(
  service: BackendService,
  context: ServerApiContext = {},
) {
  return createServerTransport(service, context, unstable_rethrow);
}
export { ApiClientError } from "./transport";
export type {
  ApiResponse,
  ApiError,
  FetchCacheOptions,
  QueryParams,
  PaginationParams,
} from "./transport";

// Domain adapters resolve the server transport through the react-server condition.
export { ApiClient, mainApi, researchApi, libraryApi } from "./server-runtime";
export * from "./service-urls";
export * from "./main";
export * from "./research";
export * from "./library";
