type CountableResponse = {
  data?: unknown[];
  meta?: {
    total?: number;
  };
};

export function getResponseCount(response?: CountableResponse) {
  if (!response) return undefined;
  return response.meta?.total ?? response.data?.length ?? 0;
}

export function formatCount(
  response: CountableResponse | undefined,
  isLoading: boolean,
  isError: boolean
) {
  if (isLoading) return "--";
  if (isError) return "Unavailable";

  const count = getResponseCount(response);
  return typeof count === "number" ? count.toLocaleString() : "--";
}
