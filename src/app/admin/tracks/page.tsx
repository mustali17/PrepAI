import { getAllTracksAdmin } from "@/actions/tracks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDifficultyColor } from "@/lib/utils";
import { TrackDialog } from "@/components/admin/track-dialog";
import { DeleteTrackButton } from "@/components/admin/delete-track-button";
import { Plus, BookOpen } from "lucide-react";

export default async function AdminTracksPage() {
  const tracks = await getAllTracksAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Tracks</h1>
          <p className="text-muted-foreground">{tracks.length} interview tracks</p>
        </div>
        <TrackDialog mode="create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Track
          </Button>
        </TrackDialog>
      </div>

      {tracks.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tracks created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <Card key={track.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                      {track.icon ?? "🎯"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{track.title}</h3>
                        <Badge className={getDifficultyColor(track.difficulty)} variant="outline">
                          {track.difficulty}
                        </Badge>
                        {!track.isPublished && (
                          <Badge variant="outline" className="bg-gray-100">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {track.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {track._count.questions} questions · {track._count.sessions} sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TrackDialog mode="edit" track={track}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </TrackDialog>
                    <DeleteTrackButton trackId={track.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
