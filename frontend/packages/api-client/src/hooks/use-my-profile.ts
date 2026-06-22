import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { myProfileApi } from "../main/api";
import type { MyProfileUpdatePayload } from "../main/types";
import { queryKeys } from "./query-keys";

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.myProfile.detail,
    queryFn: () => myProfileApi.get(),
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MyProfileUpdatePayload) => myProfileApi.update(data),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.myProfile.detail, response);
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
    },
  });
}
