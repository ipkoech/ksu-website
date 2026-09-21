import "server-only";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiClientError, mainApi } from "@ksu/api-client/server";
import {
  normalizeSections,
  unwrapHomepageCompositionResponse,
  type HomepageCompositionState,
  type HomepageCompositionApiResponse,
} from "./homepage-sections";

export const getComposedHomepage = cache(
  async (): Promise<HomepageCompositionState> => {
    try {
      const response =
        await mainApi.get<HomepageCompositionApiResponse>("/api/v1/homepage");
      const composition = unwrapHomepageCompositionResponse(response);
      if (!composition) {
        throw new ApiClientError(
          "Invalid homepage composition",
          502,
          undefined,
          "INVALID_RESPONSE",
        );
      }

      const sections = normalizeSections(composition.sections);
      return {
        data: { ...composition, sections },
        sections,
        rawSections: composition.sections ?? [],
        hasRenderableSections: sections.length > 0,
        error: null,
      };
    } catch (error) {
      unstable_rethrow(error);
      const absent = error instanceof ApiClientError && error.status === 404;
      if (!absent) noStore();
      if (!isAbortError(error)) {
        if (!absent) console.warn("Failed to load composed homepage", error);
      }
      return {
        data: null,
        sections: [],
        rawSections: [],
        hasRenderableSections: false,
        error: absent
          ? null
          : {
              code:
                error instanceof ApiClientError &&
                error.code === "INVALID_RESPONSE"
                  ? "INVALID_RESPONSE"
                  : "UPSTREAM_UNAVAILABLE",
              message: "Homepage content is temporarily unavailable.",
              ...(error instanceof ApiClientError
                ? { status: error.status }
                : {}),
            },
      };
    }
  },
);

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}
