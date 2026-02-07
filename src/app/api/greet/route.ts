import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key is not configured" },
        { status: 500 },
      );
    }

    if (!voiceId) {
      return NextResponse.json(
        { error: "ElevenLabs Voice ID is not configured" },
        { status: 500 },
      );
    }

    const sanitizedName = name.trim().slice(0, 100);

    // Build a personalized Jamaican greeting that calls them bomboclaat
    const greetingText = `Wah gwaan ${sanitizedName}! Yuh bomboclaat, welcome to di ting! Big up yuhself ${sanitizedName}, yuh done know seh yuh a di real bomboclaat massive!`;

    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: greetingText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.85,
          style: 0.6,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`ElevenLabs API error (${response.status}):`, errorBody);
      return NextResponse.json(
        {
          error: "Failed to generate speech",
          details:
            process.env.NODE_ENV === "development" ? errorBody : undefined,
        },
        { status: response.status },
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Greet API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
