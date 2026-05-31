import { getUserNotes } from "@/actions/notes";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Pin, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { NoteDialog } from "@/components/notes/note-dialog";
import { NoteActions } from "@/components/notes/note-actions";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const notes = await getUserNotes(search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-muted-foreground">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <NoteDialog mode="create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </NoteDialog>
      </div>

      {notes.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No notes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Save important concepts, interview tips, and study material.
            </p>
            <NoteDialog mode="create">
              <Button>Create your first note</Button>
            </NoteDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                  {note.isPinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <NoteActions note={note} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
