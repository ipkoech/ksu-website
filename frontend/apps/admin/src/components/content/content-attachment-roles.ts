import type { AttachmentRoleOption } from "@/components/media";

export const contentAttachmentRoles: AttachmentRoleOption[] = [
  { value: "attachment", label: "Attachment", description: "Attach any supporting file to this content record." },
  { value: "document", label: "Document", description: "Attach a downloadable document." },
  { value: "gallery", label: "Gallery image", description: "Attach an image for related media galleries.", mediaType: "image", accept: "image/*" },
];
