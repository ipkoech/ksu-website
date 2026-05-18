import { NextRequest } from "next/server";
import { proxyAdminRequest } from "../../_utils";

export async function GET(request: NextRequest) {
  return proxyAdminRequest(request, "/api/v1/admin/system/settings", { includeBody: false });
}

export async function PUT(request: NextRequest) {
  return proxyAdminRequest(request, "/api/v1/admin/system/settings");
}
