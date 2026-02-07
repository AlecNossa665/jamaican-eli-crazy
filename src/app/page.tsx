"use client";

import { GreetingPlayer } from "@/components/greeting-player";
import { LandingLayout } from "@/components/landing/landing-layout";

export default function LandingPage() {
  return (
    <LandingLayout>
      <GreetingPlayer />
    </LandingLayout>
  );
}
