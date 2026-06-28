"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { startInterview } from "@/actions/interviews";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartInterviewButtonProps {
  trackId?: string;
  practiceSetId?: string;
  label?: string;
  variant?: "default" | "outline";
  className?: string;
}

export function StartInterviewButton({
  trackId,
  practiceSetId,
  label = "Start Interview",
  variant = "default",
  className,
}: StartInterviewButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStart = () => {
    startTransition(async () => {
      const result = await startInterview({ trackId, practiceSetId });
      if (result?.interview) {
        router.push(`/dashboard/interviews/${result.interview.id}`);
      }
    });
  };

  return (
    <Button
      onClick={handleStart}
      disabled={isPending}
      variant={variant}
      className={cn("w-full gap-2", className)}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
      {isPending ? "Starting..." : label}
    </Button>
  );
}
