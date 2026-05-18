import { NextRequest, NextResponse } from "next/server";

import { normalizeBackendUser, unwrapApiData } from "../_utils";

const API_URL = process.env.MAIN_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await response.json();

    if (!response.ok) {
      // Normalize error response - backend may use 'message' or 'detail'
      const errorMessage = raw.message || raw.detail || "Login failed";
      return NextResponse.json(
        { detail: errorMessage, code: raw.code || "error" },
        { status: response.status }
      );
    }

    const data = unwrapApiData<{
      access_token: string;
      refresh_token: string;
      token_type?: string;
    }>(raw);

    const meResponse = await fetch(`${API_URL}/api/v1/auth/me?fields=id,email,full_name,avatar_url,roles,permissions`, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    if (!meResponse.ok) {
      return NextResponse.json(
        { detail: "Authenticated, but failed to load user profile" },
        { status: 502 }
      );
    }

    const meRaw = await meResponse.json();
    const user = normalizeBackendUser(meRaw);

    const res = NextResponse.json({
      user,
      message: "Login successful",
    });

    // Set httpOnly cookies for tokens
    if (data.access_token) {
      res.cookies.set("ksu_access", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
      });
    }

    if (data.refresh_token) {
      res.cookies.set("ksu_refresh", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { detail: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}
