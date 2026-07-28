import { HeriCrudWorkspace } from "../_components/heri-crud-workspace";

export default function HeriHeroSlidesPage() {
  return (
    <HeriCrudWorkspace
      config={{
        resource: "hero-slides",
        title: "Homepage hero slides",
        description:
          "Manage the published HERI Africa homepage carousel. Active slides are published directly in position order.",
        permission: "heri.content.write",
        fields: [
          { name: "eyebrow", label: "Eyebrow" },
          { name: "title", label: "Title", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "image_url", label: "Desktop image URL", required: true },
          { name: "mobile_image_url", label: "Mobile image URL" },
          { name: "button_label", label: "Button label" },
          { name: "button_href", label: "Button destination" },
          { name: "position", label: "Position", type: "number" },
          { name: "is_active", label: "Published", type: "boolean" },
        ],
      }}
    />
  );
}
