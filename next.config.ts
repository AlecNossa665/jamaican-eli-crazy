import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "promptlayer",
    "@anthropic-ai/bedrock-sdk",
    "@anthropic-ai/vertex-sdk",
    "@google/genai",
    "openai",
    "anthropic",
  ],
};

export default nextConfig;
