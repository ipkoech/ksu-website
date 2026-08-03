import { HeriCrudWorkspace } from "../_components/heri-crud-workspace";

export default function HeriHeroSlidesPage() {
  return (
    <HeriCrudWorkspace
      config={{
        resource: "hero-slides",
        title: "Homepage hero slides",
        description:
          "Manage the homepage hero carousel: copy, destinations, desktop/mobile media, ordering, and publication state. Use the media picker to upload or select approved assets.",
        permission: "heri.content.write",
        fields: [
          { name: "eyebrow", label: "Eyebrow" },
          { name: "title", label: "Title", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "image_url", label: "Desktop hero image", type: "media", required: true },
          { name: "mobile_image_url", label: "Mobile hero image", type: "media" },
          { name: "button_label", label: "Button label" },
          { name: "button_href", label: "Button destination" },
          { name: "position", label: "Position", type: "number" },
          { name: "is_active", label: "Published", type: "boolean" },
        ],
      }}
    />
  );
}
