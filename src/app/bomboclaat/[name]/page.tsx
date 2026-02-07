"use client";

import { GreetingPlayer } from "@/components/greeting-player";
import { LandingLayout } from "@/components/landing/landing-layout";
import { safeDecodeUriComponent } from "@/lib/utils";
import { use } from "react";

export default function BomboclaatPage({
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
          Incoming greeting for{" "}
          <span className="font-semibold text-zinc-200">{decodedName}</span>
        </>
      }
    >
      <GreetingPlayer initialName={decodedName} autoPlay hideShareUrl />
    </LandingLayout>
  );
}
