import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.MAIN_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("ksu_access")?.value;
    const refreshToken = request.cookies.get("ksu_refresh")?.value;

    if (accessToken) {
      // Backend logout revokes the current session using the access token JTI.
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {
        // Ignore backend failures - cookies are still cleared below.
      });
    }

    const res = NextResponse.json({ message: "Logged out successfully" });

    // Clear cookies
    res.cookies.set("ksu_access", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    res.cookies.set("ksu_refresh", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear cookies even on error
    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.set("ksu_access", "", { maxAge: 0, path: "/" });
    res.cookies.set("ksu_refresh", "", { maxAge: 0, path: "/" });
    return res;
  }
}
