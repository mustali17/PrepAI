import { getTracks } from "@/actions/tracks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDifficultyColor } from "@/lib/utils";
import { Brain, BookOpen, Users } from "lucide-react";
import { StartInterviewButton } from "@/components/interviews/start-interview-button";

export default async function TracksPage() {
  const tracks = await getTracks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Interview Tracks</h1>
        <p className="text-muted-foreground">
          Choose a track to practice. Each track has curated questions for that role.
        </p>
      </div>

      {tracks.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No tracks available yet</h3>
            <p className="text-sm text-muted-foreground">
              Check back soon — the admin is adding tracks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track) => (
            <Card key={track.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl mb-3">
                    {track.icon ?? "🎯"}
                  </div>
                  <Badge className={getDifficultyColor(track.difficulty)} variant="outline">
                    {track.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{track.title}</CardTitle>
                <CardDescription className="line-clamp-2">{track.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    {track._count.questions} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {track._count.sessions} attempts
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <StartInterviewButton trackId={track.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
