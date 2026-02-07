import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/health/supabase
 * Verifies the app is connected to Supabase (env + reachable API).
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Supabase env vars",
        details: {
          hasUrl: !!url,
          hasAnonKey: !!anonKey,
        },
      },
      { status: 503 }
    );
  }

  if (anonKey === "your-anon-key") {
    return NextResponse.json(
      {
        ok: false,
        error: "Replace NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local with your project's anon key",
        url,
      },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: "Supabase API error",
          details: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Connected to Supabase",
      url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: "Connection failed",
        details: message,
      },
      { status: 503 }
    );
  }
}
