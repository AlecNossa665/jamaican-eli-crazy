import { NextRequest, NextResponse } from "next/server";
import {
  checkEnv,
  errorToResponse,
  generateGreetingAudio,
  validateName,
} from "@/lib/greet-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nameResult = validateName(body?.name);
    if (!nameResult.ok) {
      const { status, body: resBody } = errorToResponse(nameResult.error);
      return NextResponse.json(resBody, { status });
    }

    const envError = checkEnv();
    if (envError) {
      const { status, body: resBody } = errorToResponse(envError);
      return NextResponse.json(resBody, { status });
    }

    const audioBuffer = await generateGreetingAudio(nameResult.name, true);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      "status" in err &&
      (err.code === "PROMPTLAYER_ERROR" || err.code === "ELEVENLABS_ERROR")
    ) {
      const { status, body } = errorToResponse(
        err as Parameters<typeof errorToResponse>[0],
      );
      return NextResponse.json(body, { status });
    }
    console.error("Greet pussyclaat API error:", err);
    const { status, body } = errorToResponse({ code: "INTERNAL", status: 500 });
    return NextResponse.json(body, { status });
  }
}
