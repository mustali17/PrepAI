"use client";

import { useTransition } from "react";
import { deleteNote, togglePinNote } from "@/actions/notes";
import { Button } from "@/components/ui/button";
import { NoteDialog } from "./note-dialog";
import { Trash2, Pin, PinOff, Pencil, Loader2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
}

export function NoteActions({ note }: { note: Note }) {
  const [isDeleting, startDelete] = useTransition();
  const [isPinning, startPin] = useTransition();

  const handleDelete = () => {
    if (!confirm("Delete this note?")) return;
    startDelete(async () => {
      await deleteNote(note.id);
    });
  };

  const handlePin = () => {
    startPin(async () => {
      await togglePinNote(note.id);
    });
  };

  return (
    <div className="flex items-center gap-1 w-full">
      <Button
        size="sm"
        variant="ghost"
        onClick={handlePin}
        disabled={isPinning}
        className="flex-1 gap-1"
        title={note.isPinned ? "Unpin" : "Pin"}
      >
        {isPinning ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : note.isPinned ? (
          <PinOff className="h-3 w-3" />
        ) : (
          <Pin className="h-3 w-3" />
        )}
        {note.isPinned ? "Unpin" : "Pin"}
      </Button>
      <NoteDialog mode="edit" note={note}>
        <Button size="sm" variant="ghost" className="flex-1 gap-1">
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      </NoteDialog>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      </Button>
    </div>
  );
}
