/**
 * Shared logic for greeting API routes: validation, PromptLayer, ElevenLabs.
 * Used by /api/greet and /api/greet-pussyclaat.
 */

import { generateGreeting } from "@/lib/promptlayer";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const MAX_NAME_LENGTH = 100;

const VOICE_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.85,
  style: 0.6,
  use_speaker_boost: true,
} as const;

export type GreetApiError =
  | { code: "MISSING_NAME"; status: 400 }
  | { code: "MISSING_ELEVENLABS_KEY"; status: 500 }
  | { code: "MISSING_VOICE_ID"; status: 500 }
  | { code: "MISSING_PROMPTLAYER_KEY"; status: 500 }
  | { code: "PROMPTLAYER_ERROR"; status: 500; details?: string }
  | { code: "ELEVENLABS_ERROR"; status: number; details?: string }
  | { code: "INTERNAL"; status: 500 };

export function validateName(
  name: unknown,
): { ok: true; name: string } | { ok: false; error: GreetApiError } {
  if (name == null || typeof name !== "string") {
    return { ok: false, error: { code: "MISSING_NAME", status: 400 } };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: { code: "MISSING_NAME", status: 400 } };
  }
  return { ok: true, name: trimmed.slice(0, MAX_NAME_LENGTH) };
}

export function checkEnv(): GreetApiError | null {
  if (!process.env.ELEVENLABS_API_KEY) {
    return { code: "MISSING_ELEVENLABS_KEY", status: 500 };
  }
  if (!process.env.ELEVENLABS_VOICE_ID) {
    return { code: "MISSING_VOICE_ID", status: 500 };
  }
  if (!process.env.PROMPTLAYER_API_KEY) {
    return { code: "MISSING_PROMPTLAYER_KEY", status: 500 };
  }
  return null;
}

/**
 * Generates greeting audio for the given name.
 * Returns the audio buffer or throws (caller should map to response).
 */
export async function generateGreetingAudio(
  name: string,
  pussyclaat: boolean,
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY!;
  const voiceId = process.env.ELEVENLABS_VOICE_ID!;

  let greetingText: string;
  try {
    greetingText = await generateGreeting(name, pussyclaat);
  } catch (err) {
    console.error("PromptLayer error:", err);
    const details =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : undefined;
    throw { code: "PROMPTLAYER_ERROR" as const, status: 500, details };
  }

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
      voice_settings: VOICE_SETTINGS,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`ElevenLabs API error (${response.status}):`, errorBody);
    throw {
      code: "ELEVENLABS_ERROR" as const,
      status: response.status,
      details: process.env.NODE_ENV === "development" ? errorBody : undefined,
    };
  }

  return response.arrayBuffer();
}

export function errorToResponse(error: GreetApiError): {
  status: number;
  body: { error: string; details?: string };
} {
  const messages: Record<GreetApiError["code"], string> = {
    MISSING_NAME: "Name is required",
    MISSING_ELEVENLABS_KEY: "ElevenLabs API key is not configured",
    MISSING_VOICE_ID: "ElevenLabs Voice ID is not configured",
    MISSING_PROMPTLAYER_KEY: "PromptLayer API key is not configured",
    PROMPTLAYER_ERROR: "Failed to generate greeting text",
    ELEVENLABS_ERROR: "Failed to generate speech",
    INTERNAL: "Internal server error",
  };
  const body: { error: string; details?: string } = {
    error: messages[error.code],
  };
  if ("details" in error && error.details != null) {
    body.details = error.details;
  }
  return { status: error.status, body };
}
