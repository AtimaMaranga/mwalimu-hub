import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.DAILY_API_KEY;
  const diagnostics: Record<string, unknown> = {
    has_api_key: !!key,
    key_length: key?.length ?? 0,
    key_prefix: key?.slice(0, 6) ?? "missing",
  };

  if (!key) {
    return NextResponse.json({
      ...diagnostics,
      error: "DAILY_API_KEY is not set in environment variables",
    });
  }

  // Try to list rooms to verify the key works
  try {
    const res = await fetch("https://api.daily.co/v1/rooms?limit=1", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
    });

    const body = await res.json().catch(() => ({}));

    diagnostics.daily_api_status = res.status;
    diagnostics.daily_api_ok = res.ok;

    if (!res.ok) {
      diagnostics.daily_api_error = body;
      return NextResponse.json({
        ...diagnostics,
        error: `Daily API returned ${res.status} — key may be invalid or expired`,
      });
    }

    diagnostics.total_rooms = body.total_count ?? "unknown";
    return NextResponse.json({
      ...diagnostics,
      success: true,
      message: "Daily.co API key is valid and working",
    });
  } catch (err: any) {
    return NextResponse.json({
      ...diagnostics,
      error: `Failed to reach Daily API: ${err.message}`,
    });
  }
}
