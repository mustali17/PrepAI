"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { startInterview } from "@/actions/interviews";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";

interface StartInterviewButtonProps {
  trackId: string;
  trackTitle: string;
}

export function StartInterviewButton({ trackId, trackTitle }: StartInterviewButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStart = () => {
    startTransition(async () => {
      const result = await startInterview(trackId);
      if (result?.interview) {
        router.push(`/dashboard/interviews/${result.interview.id}`);
      }
    });
  };

  return (
    <Button onClick={handleStart} disabled={isPending} className="w-full gap-2">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {isPending ? "Starting..." : "Start Interview"}
    </Button>
  );
}
