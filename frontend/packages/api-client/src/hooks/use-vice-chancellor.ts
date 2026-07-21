import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { viceChancellorApi } from "../main/api";
import type {
  VcGalleryPayload,
  VcHubUpdatePayload,
  VcPlacementPayload,
  VcSpeechPayload,
  VcVideoPayload,
  VcWorkflowAction,
} from "../main/types";
import { queryKeys } from "./query-keys";

const keys = queryKeys.viceChancellor;

function useVcInvalidation() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: keys.all });
}

export function useVcHub() {
  return useQuery({ queryKey: keys.hub, queryFn: viceChancellorApi.hub });
}
export function useVcVideos() {
  return useQuery({ queryKey: keys.videos, queryFn: () => viceChancellorApi.listVideos({ per_page: 100 }) });
}
export function useVcSpeeches() {
  return useQuery({ queryKey: keys.speeches, queryFn: () => viceChancellorApi.listSpeeches({ per_page: 100 }) });
}
export function useVcGalleries() {
  return useQuery({ queryKey: keys.galleries, queryFn: () => viceChancellorApi.listGalleries({ per_page: 100 }) });
}
export function useVcPlacements() {
  return useQuery({ queryKey: keys.placements, queryFn: viceChancellorApi.listPlacements });
}
export function useVcNewsLookup(q?: string) {
  return useQuery({ queryKey: keys.newsLookup(q), queryFn: () => viceChancellorApi.lookupNews(q) });
}
export function useVcEventsLookup(q?: string) {
  return useQuery({ queryKey: keys.eventsLookup(q), queryFn: () => viceChancellorApi.lookupEvents(q) });
}

export function useUpdateVcHub() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: (data: VcHubUpdatePayload) => viceChancellorApi.updateHub(data), onSuccess: invalidate });
}
export function useVcHubWorkflow() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: ({ action, reason }: { action: VcWorkflowAction; reason?: string }) => viceChancellorApi.transitionHub(action, reason), onSuccess: invalidate });
}
export function useCreateVcVideo() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: (data: VcVideoPayload) => viceChancellorApi.createVideo(data), onSuccess: invalidate });
}
export function useUpdateVcVideo() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<VcVideoPayload> }) => viceChancellorApi.updateVideo(id, data), onSuccess: invalidate });
}
export function useDeleteVcVideo() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: viceChancellorApi.deleteVideo, onSuccess: invalidate });
}
export function useCreateVcSpeech() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: (data: VcSpeechPayload) => viceChancellorApi.createSpeech(data), onSuccess: invalidate });
}
export function useUpdateVcSpeech() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<VcSpeechPayload> }) => viceChancellorApi.updateSpeech(id, data), onSuccess: invalidate });
}
export function useDeleteVcSpeech() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: viceChancellorApi.deleteSpeech, onSuccess: invalidate });
}
export function useCreateVcGallery() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: (data: VcGalleryPayload) => viceChancellorApi.createGallery(data), onSuccess: invalidate });
}
export function useUpdateVcGallery() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<VcGalleryPayload> }) => viceChancellorApi.updateGallery(id, data), onSuccess: invalidate });
}
export function useDeleteVcGallery() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: viceChancellorApi.deleteGallery, onSuccess: invalidate });
}
export function useCreateVcPlacement() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: (data: VcPlacementPayload) => viceChancellorApi.createPlacement(data), onSuccess: invalidate });
}
export function useUpdateVcPlacement() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<VcPlacementPayload> }) => viceChancellorApi.updatePlacement(id, data), onSuccess: invalidate });
}
export function useDeleteVcPlacement() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: viceChancellorApi.deletePlacement, onSuccess: invalidate });
}
export function useVcContentWorkflow() {
  const invalidate = useVcInvalidation();
  return useMutation({ mutationFn: ({ resource, id, action, reason }: { resource: "videos" | "speeches" | "galleries"; id: string; action: VcWorkflowAction; reason?: string }) => viceChancellorApi.transition(resource, id, action, reason), onSuccess: invalidate });
}
