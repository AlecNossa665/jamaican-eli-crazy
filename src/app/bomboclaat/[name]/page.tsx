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
          Di spirits have a message fi{" "}
          <span className="font-semibold text-amber-300">{decodedName}</span>…
          prepare yuhself
        </>
      }
    >
      <GreetingPlayer initialName={decodedName} autoPlay hideShareUrl />
    </LandingLayout>
  );
}
