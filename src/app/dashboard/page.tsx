import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserAnalytics } from "@/actions/interviews";
import { getUserInterviews } from "@/actions/interviews";
import { getTracks } from "@/actions/tracks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
  Flame,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [analytics, recentInterviews, tracks] = await Promise.all([
    getUserAnalytics(),
    getUserInterviews(),
    getTracks(),
  ]);

  const recentSessions = recentInterviews.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">Track your progress and keep practicing.</p>
        </div>
        <Link href="/dashboard/tracks">
          <Button className="gap-2">
            <Brain className="h-4 w-4" />
            Start Interview
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold">{analytics?.totalSessions ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{analytics?.completedCount ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-3xl font-bold">{analytics?.avgScore ?? "—"}/10</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            {analytics && analytics.avgScore > 0 && (
              <Progress
                value={(analytics.avgScore / 10) * 100}
                className="mt-3 h-1.5"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Tracks</p>
                <p className="text-3xl font-bold">{tracks.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Interviews */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Interviews</CardTitle>
              <Link href="/dashboard/interviews">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No interviews yet</p>
                  <Link href="/dashboard/tracks">
                    <Button size="sm">Start your first interview</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                          {session.track.icon ?? "🎯"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{session.track.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(session.startedAt)} · {session._count.answers} questions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.overallScore !== null && (
                          <span className="text-sm font-medium">
                            {session.overallScore.toFixed(1)}/10
                          </span>
                        )}
                        <Badge
                          className={getStatusColor(session.status)}
                          variant="outline"
                        >
                          {session.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weak / Strong areas */}
        <div className="space-y-4">
          {analytics && analytics.topWeak.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Focus Areas
                </CardTitle>
                <CardDescription>Topics to improve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.topWeak.map((area) => (
                    <Badge key={area} variant="outline" className="bg-red-50 text-red-700">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics && analytics.topStrong.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-green-500" />
                  Strong Areas
                </CardTitle>
                <CardDescription>Your best topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.topStrong.map((area) => (
                    <Badge key={area} variant="outline" className="bg-green-50 text-green-700">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Start */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tracks.slice(0, 3).map((track) => (
                <Link key={track.id} href={`/dashboard/tracks`}>
                  <div className="text-sm py-1.5 px-2 rounded hover:bg-primary/10 transition-colors cursor-pointer">
                    {track.icon ?? "📚"} {track.title}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
