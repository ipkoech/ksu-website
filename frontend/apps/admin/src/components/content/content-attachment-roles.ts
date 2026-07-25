import type { AttachmentRoleOption } from "@/components/media";

export const contentAttachmentRoles: AttachmentRoleOption[] = [
  {
    value: "cover-image",
    label: "Cover image",
    description: "Alternative editorial cover image.",
    mediaType: "image",
    accept: "image/*",
  },
  {
    value: "cover-video",
    label: "Cover video",
    description: "Video displayed as the editorial hero when published.",
    mediaType: "video",
    accept: "video/*",
  },
  {
    value: "video-poster",
    label: "Video poster",
    description: "Accessible poster image shown before a cover video plays.",
    mediaType: "image",
    accept: "image/*",
  },
  {
    value: "attachment",
    label: "Attachment",
    description: "Attach any supporting file to this content record.",
  },
  {
    value: "document",
    label: "Document",
    description: "Attach a downloadable document.",
  },
  {
    value: "gallery",
    label: "Gallery image",
    description: "Attach an image for related media galleries.",
    mediaType: "image",
    accept: "image/*",
  },
  {
    value: "video",
    label: "Supporting video",
    description: "Attach a video to the story media collection.",
    mediaType: "video",
    accept: "video/*",
  },
];
