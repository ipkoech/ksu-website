import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.MAIN_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("ksu_refresh")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { detail: "No refresh token available" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.detail || error.message || "Token refresh failed";
      return NextResponse.json(
        { detail: errorMessage },
        { status: response.status }
      );
    }

    const raw = await response.json();
    const data = raw.data || raw;

    const res = NextResponse.json({
      message: "Token refreshed",
    });

    // Update access token cookie
    if (data.access_token) {
      res.cookies.set("ksu_access", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
      });
    }

    // Update refresh token cookie if a new one was issued
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
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { detail: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}