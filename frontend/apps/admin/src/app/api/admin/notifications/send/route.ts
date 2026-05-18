import { NextRequest } from "next/server";
import { proxyAdminRequest } from "../../_utils";

export async function POST(request: NextRequest) {
  return proxyAdminRequest(request, "/api/v1/admin/notifications/send");
}
