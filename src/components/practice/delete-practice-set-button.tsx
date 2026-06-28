"use client";

import { useTransition } from "react";
import { deletePracticeSet } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function DeletePracticeSetButton({ practiceSetId }: { practiceSetId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Delete this practice set and all its questions?")) return;
    startTransition(async () => {
      await deletePracticeSet(practiceSetId);
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
