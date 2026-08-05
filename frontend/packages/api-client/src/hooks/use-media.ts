import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type {
  Media,
  MediaFolderCreatePayload,
  MediaFolderUpdatePayload,
  MediaLinkCreatePayload,
  MediaLinkUpdatePayload,
  MediaUpdatePayload,
  MediaUploadOptions,
} from "../main/types";
import type { FieldSelectionParams, PaginationParams } from "../client";

type MediaListParams = PaginationParams & {
  folder_id?: string;
  media_type?: string;
  uploaded_by_id?: string;
  entity_type?: string;
  entity_id?: string;
  role?: string;
  search?: string;
  fields?: string;
  include?: string;
};

type MediaLinksParams = FieldSelectionParams & {
  entity_type: string;
  entity_id: string;
  role?: string;
};

export function useMedia(params?: MediaListParams) {
  return useQuery({
    queryKey: queryKeys.media.list(params),
    queryFn: () => mediaApi.list(params),
  });
}

export function useMediaItem(id: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: [...queryKeys.media.detail(id), { fields: options?.fields, include: options?.include }],
    queryFn: () => mediaApi.get(id, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      folderId,
      isPublic,
      entityType,
      entityId,
      role,
    }: {
      file: File;
    } & MediaUploadOptions) => mediaApi.upload(file, { folderId, isPublic, entityType, entityId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MediaUpdatePayload }) => mediaApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.detail(id) });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useMediaFolders(params?: FieldSelectionParams & { parent_id?: string }) {
  return useQuery({
    queryKey: queryKeys.media.folders(params),
    queryFn: () => mediaApi.listFolders(params),
  });
}

export function useCreateMediaFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MediaFolderCreatePayload) => mediaApi.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.folders() });
    },
  });
}

export function useMediaFolder(id: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: [...queryKeys.media.folder(id), { fields: options?.fields, include: options?.include }],
    queryFn: () => mediaApi.getFolder(id, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useUpdateMediaFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MediaFolderUpdatePayload }) => mediaApi.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.folders() });
    },
  });
}

export function useDeleteMediaFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.folders() });
    },
  });
}

export function useMediaLinks(params: MediaLinksParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.media.links(params),
    queryFn: () => mediaApi.listLinks(params),
    enabled: options?.enabled !== false && !!params.entity_type && !!params.entity_id,
  });
}

export function useCreateMediaLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MediaLinkCreatePayload) => mediaApi.createLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useMediaLink(id: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: [...queryKeys.media.link(id), { fields: options?.fields, include: options?.include }],
    queryFn: () => mediaApi.getLink(id, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useUpdateMediaLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MediaLinkUpdatePayload }) => mediaApi.updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useDeleteMediaLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaApi.deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}
