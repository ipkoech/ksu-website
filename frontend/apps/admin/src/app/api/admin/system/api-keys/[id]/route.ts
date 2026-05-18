import { NextRequest } from "next/server";
import { proxyAdminRequest } from "../../../_utils";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdminRequest(request, `/api/v1/admin/system/api-keys/${id}`, { includeBody: false });
}
