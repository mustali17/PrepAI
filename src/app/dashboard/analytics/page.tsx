import { getUserAnalytics } from "@/actions/interviews";
import { analyzeWeakAreas } from "@/actions/ai";
import { getUserInterviews } from "@/actions/interviews";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreChart } from "@/components/analytics/score-chart";
import Link from "next/link";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Brain,
  Target,
  BookOpen,
} from "lucide-react";

export default async function AnalyticsPage() {
  const [analytics, interviews] = await Promise.all([
    getUserAnalytics(),
    getUserInterviews(),
  ]);

  const completedInterviews = interviews.filter((i) => i.status === "COMPLETED");

  let studyPlan = null;
  if (completedInterviews.length >= 2) {
    try {
      const data = completedInterviews.map((i) => ({
        weakAreas: (i as { weakAreas?: string[] }).weakAreas ?? [],
        strongAreas: (i as { strongAreas?: string[] }).strongAreas ?? [],
        overallScore: i.overallScore ?? 0,
      }));
      studyPlan = await analyzeWeakAreas(data);
    } catch {
      // AI service unavailable — show data without study plan
    }
  }

  if (!analytics || analytics.totalSessions === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Card className="text-center py-16">
          <CardContent>
            <BarChart3Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No data yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete interviews to see your analytics.
            </p>
            <Link href="/dashboard/tracks">
              <Button>Start an Interview</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your progress over time</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-3xl font-bold">{analytics.totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-3xl font-bold">{analytics.completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Score</p>
            <p className="text-3xl font-bold">{analytics.avgScore}/10</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Answers</p>
            <p className="text-3xl font-bold">{analytics.totalAnswers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Score History Chart */}
      {analytics.scoreHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Score Progress
            </CardTitle>
            <CardDescription>Your performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreChart data={analytics.scoreHistory} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weak Areas */}
        {analytics.topWeak.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Top Weak Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.topWeak.map((area, idx) => (
                  <div key={area} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${100 - idx * 15}%` }}
                      />
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                      {area}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strong Areas */}
        {analytics.topStrong.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Top Strong Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.topStrong.map((area, idx) => (
                  <div key={area} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${100 - idx * 15}%` }}
                      />
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                      {area}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Study Plan */}
      {studyPlan && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Personalized Study Plan
            </CardTitle>
            <CardDescription>{studyPlan.encouragement}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studyPlan.studyPlan.map((item) => (
              <div key={item.topic} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{item.topic}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.reason}</p>
                {item.resources.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.resources.map((r) => (
                      <Badge key={r} variant="secondary" className="text-xs flex items-center gap-1">
                        <BookOpen className="h-2.5 w-2.5" />
                        {r}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
