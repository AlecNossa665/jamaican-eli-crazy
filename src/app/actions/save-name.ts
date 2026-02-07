"use server";

import { createClient } from "@/lib/supabase/server";

export type SaveNameResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveName(formData: FormData): Promise<SaveNameResult> {
  const name = formData.get("name");
  const trimmed = typeof name === "string" ? name.trim() : "";

  if (!trimmed) {
    return { ok: false, error: "Please enter a name." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("names").insert({ name: trimmed });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { ok: false, error: message };
  }
}
