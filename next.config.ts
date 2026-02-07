import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@anthropic-ai/bedrock-sdk",
    "@anthropic-ai/sdk",
    "@anthropic-ai/vertex-sdk",
    "@google/genai",
    "@mistralai/mistralai",
    "@opentelemetry/api",
    "@opentelemetry/sdk-trace-base",
    "@opentelemetry/sdk-trace-node",
    "openai",
    "promptlayer",
  ],
};

export default nextConfig;
