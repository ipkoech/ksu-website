"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";

export default function ResearchFarmDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Farm Profile"
      description="View farm facilities, operations, products, capacity, contact details, and public profile fields."
      resource={researchServiceApi.farms}
      backHref="/research/farm/farms"
      publicHrefBase="/farm"
      labelFields={["farm_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Size", field: "size_hectares" },
        { label: "Location", field: "location" },
        { label: "County", field: "county" },
        { label: "Public", field: "is_public", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["summary", "about", "description"] },
        { title: "Operations", fields: ["activities", "products", "facilities", "capacity_info"] },
        { title: "Contact and Media", fields: ["manager_name", "email", "phone", "address", "cover_image_url"] },
      ]}
    />
  );
}
