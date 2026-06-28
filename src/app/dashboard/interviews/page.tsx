import { getUserInterviews } from "@/actions/interviews";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brain, Clock, CheckCircle, XCircle, ArrowRight, Plus, Star } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { DeleteInterviewButton } from "@/components/interviews/delete-interview-button";

export default async function InterviewsPage() {
  const interviews = await getUserInterviews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Interviews</h1>
          <p className="text-muted-foreground">
            {interviews.length} interview{interviews.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/dashboard/tracks">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Interview
          </Button>
        </Link>
      </div>

      {interviews.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No interviews yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start your first mock interview to track your progress.
            </p>
            <Link href="/dashboard/tracks">
              <Button>Browse Interview Tracks</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                      {interview.track?.icon ?? "🎯"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">
                          {interview.track?.title ?? interview.practiceSet?.title ?? "Practice Interview"}
                        </h3>
                        <Badge
                          className={getStatusColor(interview.status)}
                          variant="outline"
                        >
                          {interview.status === "IN_PROGRESS" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {interview.status === "COMPLETED" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {interview.status === "ABANDONED" && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {interview.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(interview.startedAt)} · {interview._count.answers} questions answered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {interview.overallScore !== null && (
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {interview.overallScore.toFixed(1)}/10
                      </div>
                    )}
                    <div className="flex gap-2">
                      {interview.status === "IN_PROGRESS" && (
                        <Link href={`/dashboard/interviews/${interview.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            Continue <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                      {interview.status === "COMPLETED" && (
                        <Link href={`/dashboard/interviews/${interview.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            Review <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                      <DeleteInterviewButton sessionId={interview.id} />
                    </div>
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
