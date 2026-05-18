import { NextRequest } from "next/server";
import { proxyAdminRequest } from "../../../_utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdminRequest(request, `/api/v1/admin/roles/${id}/permissions`, { includeBody: false });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdminRequest(request, `/api/v1/admin/roles/${id}/permissions`);
}
