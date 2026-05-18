import { NextRequest, NextResponse } from "next/server";

import { normalizeBackendUser, unwrapApiData } from "../_utils";

const API_URL = process.env.MAIN_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("ksu_access")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/v1/auth/me?fields=id,email,full_name,avatar_url,roles,permissions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshToken = request.cookies.get("ksu_refresh")?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { detail: "Not authenticated" },
          { status: 401 }
        );
      }

      const refreshResponse = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshResponse.ok) {
        const res = NextResponse.json(
          { detail: "Session expired" },
          { status: 401 }
        );
        res.cookies.set("ksu_access", "", { maxAge: 0, path: "/" });
        res.cookies.set("ksu_refresh", "", { maxAge: 0, path: "/" });
        return res;
      }

      const refreshRaw = await refreshResponse.json();
      const refreshData = unwrapApiData<{ access_token: string; refresh_token?: string }>(refreshRaw);

      // Retry with new token
      const retryResponse = await fetch(`${API_URL}/api/v1/auth/me?fields=id,email,full_name,avatar_url,roles,permissions`, {
        headers: {
          Authorization: `Bearer ${refreshData.access_token}`,
        },
      });

      if (!retryResponse.ok) {
        return NextResponse.json(
          { detail: "Authentication failed" },
          { status: 401 }
        );
      }

      const userData = await retryResponse.json();
      const res = NextResponse.json({ user: normalizeBackendUser(userData) });

      // Set new access token
      res.cookies.set("ksu_access", refreshData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      if (refreshData.refresh_token) {
        res.cookies.set("ksu_refresh", refreshData.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      }

      return res;
    }

    if (!response.ok) {
      return NextResponse.json(
        { detail: "Authentication failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ user: normalizeBackendUser(data) });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { detail: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}
