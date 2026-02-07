import OpenAI from "openai";

const PROMPTLAYER_API_URL = "https://api.promptlayer.com";

// ── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by POST /prompt-templates/{name} */
interface PromptLayerTemplateResponse {
  id: number;
  prompt_name: string;
  prompt_template: {
    type: string;
    messages?: Array<{
      role: string;
      content: Array<{ type: string; text: string }>;
    }>;
    content?: Array<{ type: string; text: string }>;
    input_variables: string[];
    template_format: string;
  };
  metadata?: {
    model?: {
      provider?: string;
      name?: string;
      parameters?: Record<string, unknown>;
    };
    [key: string]: unknown;
  };
  llm_kwargs?: Record<string, unknown>;
  version: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPromptLayerApiKey(): string {
  const apiKey = process.env.PROMPTLAYER_API_KEY;
  if (!apiKey) {
    throw new Error("PROMPTLAYER_API_KEY is not set");
  }
  return apiKey;
}

function getOpenAIApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return apiKey;
}

/**
 * Fetches a prompt template from PromptLayer's REST API with input variables
 * filled in and llm_kwargs formatted for OpenAI.
 */
async function fetchPromptTemplate(
  promptName: string,
  inputVariables: Record<string, string>,
  label: string = "prod",
): Promise<PromptLayerTemplateResponse> {
  const plApiKey = getPromptLayerApiKey();
  const url = `${PROMPTLAYER_API_URL}/prompt-templates/${encodeURIComponent(promptName)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": plApiKey,
    },
    body: JSON.stringify({
      label,
      provider: "openai",
      input_variables: inputVariables,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PromptLayer API error (${res.status}): ${body}`);
  }

  return res.json() as Promise<PromptLayerTemplateResponse>;
}

/**
 * Converts raw OpenAI messages into PromptLayer's Prompt Blueprint format.
 */
function messagesToBlueprint(messages: OpenAI.ChatCompletionMessageParam[]): {
  type: string;
  messages: Array<{
    role: string;
    content: Array<{ type: string; text: string }>;
  }>;
} {
  return {
    type: "chat",
    messages: messages.map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === "string"
          ? [{ type: "text", text: msg.content }]
          : Array.isArray(msg.content)
            ? msg.content.map((part) => {
                if ("text" in part) {
                  return { type: "text", text: part.text };
                }
                return { type: "text", text: JSON.stringify(part) };
              })
            : [{ type: "text", text: String(msg.content ?? "") }],
    })),
  };
}

/**
 * Converts an OpenAI chat completion response into PromptLayer's Prompt Blueprint format.
 */
function completionToBlueprint(completion: OpenAI.ChatCompletion): {
  type: string;
  messages: Array<{
    role: string;
    content: Array<{ type: string; text: string }>;
  }>;
} {
  const choice = completion.choices?.[0];
  const text = choice?.message?.content ?? "";
  return {
    type: "chat",
    messages: [
      {
        role: "assistant",
        content: [{ type: "text", text }],
      },
    ],
  };
}

/**
 * Logs a completed request back to PromptLayer for tracking.
 * Fire-and-forget — errors are logged but not thrown.
 */
async function logToPromptLayer(
  promptName: string,
  promptVersion: number,
  promptId: number,
  inputVariables: Record<string, string>,
  messages: OpenAI.ChatCompletionMessageParam[],
  completion: OpenAI.ChatCompletion,
  model: string,
  requestStartTime: number,
  requestEndTime: number,
): Promise<void> {
  try {
    const plApiKey = getPromptLayerApiKey();

    const inputBlueprint = messagesToBlueprint(messages);
    const outputBlueprint = completionToBlueprint(completion);

    const res = await fetch(`${PROMPTLAYER_API_URL}/log-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": plApiKey,
      },
      body: JSON.stringify({
        provider: "openai",
        model,
        input: inputBlueprint,
        output: outputBlueprint,
        request_start_time: requestStartTime,
        request_end_time: requestEndTime,
        prompt_name: promptName,
        prompt_id: promptId,
        prompt_version_number: promptVersion,
        prompt_input_variables: inputVariables,
        function_name: "openai.chat.completions.create",
        api_type: "chat-completions",
        input_tokens: completion.usage?.prompt_tokens ?? 0,
        output_tokens: completion.usage?.completion_tokens ?? 0,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`PromptLayer log-request failed (${res.status}): ${body}`);
    }
  } catch (err) {
    console.error("Failed to log request to PromptLayer:", err);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Uses PromptLayer's "Island Prompt" template to generate a personalized
 * Jamaican greeting for the given name.
 *
 * Instead of using the PromptLayer SDK (which breaks under Turbopack due to
 * dynamic require()), this calls the PromptLayer REST API to fetch the prompt
 * template and then uses the OpenAI SDK directly to generate the completion.
 *
 * Returns the generated greeting text string.
 */
export async function generateGreeting(
  name: string,
  pussyclaat = false,
): Promise<string> {
  const promptName = pussyclaat ? "Island Prompt P" : "Island Prompt";
  const inputVariables = { name };

  // 1. Fetch the prompt template from PromptLayer (with variables filled in)
  const template = await fetchPromptTemplate(promptName, inputVariables);

  // 2. Build the OpenAI request from the returned llm_kwargs
  const llmKwargs = template.llm_kwargs;
  if (!llmKwargs) {
    throw new Error("PromptLayer did not return llm_kwargs for OpenAI");
  }

  const model =
    (llmKwargs.model as string) ??
    template.metadata?.model?.name ??
    "gpt-4o-mini";

  const messages = (llmKwargs.messages ??
    []) as OpenAI.ChatCompletionMessageParam[];
  if (messages.length === 0) {
    throw new Error("PromptLayer returned no messages in llm_kwargs");
  }

  // Extract any additional parameters (temperature, max_tokens, etc.)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { model: _m, messages: _msg, ...extraParams } = llmKwargs;

  // 3. Call OpenAI directly
  const openai = new OpenAI({ apiKey: getOpenAIApiKey() });
  const requestStartTime = Date.now() / 1000;

  const completion = await openai.chat.completions.create({
    model,
    messages,
    ...extraParams,
  });

  const requestEndTime = Date.now() / 1000;

  // 4. Extract the generated text from the OpenAI response
  const choice = completion.choices?.[0];
  const text = choice?.message?.content;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("OpenAI returned empty text");
  }

  // 5. Log the request to PromptLayer for tracking (fire-and-forget)
  logToPromptLayer(
    promptName,
    template.version,
    template.id,
    inputVariables,
    messages,
    completion,
    model,
    requestStartTime,
    requestEndTime,
  );

  return text.trim();
}
