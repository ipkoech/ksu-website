import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.MAIN_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.detail || "Request failed";
      return NextResponse.json(
        { detail: errorMessage, code: data.code || "error" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { detail: "Service unavailable" },
      { status: 503 }
    );
  }
}
