import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slidersApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Slider, SliderGroup } from "../main/types";
import type { FieldSelectionParams, PaginationParams } from "../client";

type SliderGroupListParams = PaginationParams & {
  scope_type?: string;
  scope_id?: string;
  is_main?: boolean;
};

type SliderListParams = FieldSelectionParams & {
  slider_group_id?: string;
  scope_type?: string;
  scope_id?: string;
  is_main?: boolean;
};

export function useSliderGroups(params?: SliderGroupListParams) {
  return useQuery({
    queryKey: queryKeys.sliders.groupList(params),
    queryFn: () => slidersApi.listGroups(params),
  });
}

export function useSliderGroup(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.sliders.groupDetail(id),
    queryFn: () => slidersApi.getGroup(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useSliderGroupBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["slider-groups", "slug", slug] as const,
    queryFn: () => slidersApi.getGroupBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateSliderGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SliderGroup>) => slidersApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sliders.groups });
    },
  });
}

export function useUpdateSliderGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SliderGroup> }) => slidersApi.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sliders.groups });
    },
  });
}

export function useDeleteSliderGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => slidersApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sliders.groups });
    },
  });
}

export function useSliders(params?: SliderListParams) {
  return useQuery({
    queryKey: queryKeys.sliders.sliderList(params),
    queryFn: () => slidersApi.listSliders(params),
  });
}

export function useGroupSliders(groupId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.sliders.items(groupId),
    queryFn: () => slidersApi.listGroupSliders(groupId),
    enabled: options?.enabled !== false && !!groupId,
  });
}

export function useCreateSlider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: Partial<Slider> }) => slidersApi.createSlider(groupId, data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sliders.sliderList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sliders.items(groupId) });
    },
  });
}

export function useUpdateSlider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Slider> }) => slidersApi.updateSlider(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sliders.groups });
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
  });
}

export function useDeleteSlider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => slidersApi.deleteSlider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sliders.groups });
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
  });
}
