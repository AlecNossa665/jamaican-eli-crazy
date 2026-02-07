import { PromptLayer } from "promptlayer";

interface PromptLayerContent {
  text: string;
  type?: string;
}

interface PromptLayerMessage {
  role: string;
  content: PromptLayerContent[];
}

interface PromptLayerResponse {
  request_id: number | null;
  raw_response: unknown;
  prompt_blueprint: {
    prompt_template: {
      messages: PromptLayerMessage[];
    };
  };
}

const plClient = new PromptLayer({
  apiKey: process.env.PROMPTLAYER_API_KEY,
});

/**
 * Uses PromptLayer's "Island Prompt" template to generate a personalized
 * Jamaican greeting for the given name.
 *
 * Returns the generated greeting text string.
 */
export async function generateGreeting(
  name: string,
  pussyclaat = false,
): Promise<string> {
  const response = (await plClient.run({
    promptName: pussyclaat ? "Island Prompt P" : "Island Prompt",
    promptReleaseLabel: "prod",
    inputVariables: {
      name,
    },
  })) as PromptLayerResponse;

  // Extract the generated text from the PromptLayer response.
  // The response shape is:
  //   response.prompt_blueprint.prompt_template.messages[-1].content[-1].text
  const messages = response.prompt_blueprint?.prompt_template?.messages;
  if (!messages || messages.length === 0) {
    throw new Error("PromptLayer returned no messages");
  }

  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content;

  if (!content || content.length === 0) {
    throw new Error("PromptLayer returned empty content");
  }

  const lastContent = content[content.length - 1];
  const text = lastContent.text;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("PromptLayer returned empty text");
  }

  return text.trim();
}
