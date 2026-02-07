"use client";

import { GreetingPlayer } from "@/components/greeting-player";
import { LandingLayout } from "@/components/landing/landing-layout";
import { safeDecodeUriComponent } from "@/lib/utils";
import { use } from "react";

export default function PussyclaatPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const decodedName = safeDecodeUriComponent(name);

  return (
    <LandingLayout
      subtitle={
        <>
          Di spirits have a message fi{" "}
          <span className="font-semibold text-amber-200">{decodedName}</span>
        </>
      }
    >
      <GreetingPlayer
        initialName={decodedName}
        autoPlay
        greetingType="pussyclaat"
        hideShareUrl
      />
    </LandingLayout>
  );
}
