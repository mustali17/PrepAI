"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Star,
  AlertCircle,
  TrendingUp,
  ArrowLeft,
  BarChart3,
  Brain,
  MessageSquare,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ResultsProps {
  session: {
    id: string;
    overallScore: number | null;
    aiSummary: string | null;
    weakAreas: string[];
    strongAreas: string[];
    startedAt: Date;
    completedAt: Date | null;
    track: { title: string; icon: string | null };
    answers: Array<{
      id: string;
      answer: string;
      score: number | null;
      feedback: string | null;
      suggestions: string[];
      question: { question: string; category: string };
    }>;
  };
}

export function InterviewResults({ session }: ResultsProps) {
  const score = session.overallScore ?? 0;

  const scoreColor =
    score >= 7 ? "text-green-600" : score >= 4 ? "text-yellow-600" : "text-red-600";
  const scoreLabel = score >= 7 ? "Excellent!" : score >= 4 ? "Good effort!" : "Keep practicing!";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/interviews">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Interview Results</h1>
          <p className="text-sm text-muted-foreground">
            {session.track.title} · {formatDate(session.startedAt)}
          </p>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="text-center py-8 border-2 border-primary/20 bg-primary/5">
        <CardContent>
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Star className="h-10 w-10 text-primary" />
          </div>
          <div className={`text-5xl font-bold mb-2 ${scoreColor}`}>{score.toFixed(1)}</div>
          <div className="text-muted-foreground mb-2">out of 10</div>
          <Badge className="text-sm px-3 py-1">{scoreLabel}</Badge>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {session.aiSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Interview Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{session.aiSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Weak / Strong Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {session.weakAreas.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {session.weakAreas.map((area) => (
                  <Badge key={area} variant="outline" className="bg-red-50 text-red-700">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {session.strongAreas.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Strong Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {session.strongAreas.map((area) => (
                  <Badge key={area} variant="outline" className="bg-green-50 text-green-700">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Answer-by-Answer Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Answer Review
          </CardTitle>
          <CardDescription>{session.answers.length} questions answered</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session.answers.map((answer, idx) => (
            <div key={answer.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">Q{idx + 1}</span>
                    <Badge variant="secondary" className="text-xs">
                      {answer.question.category}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{answer.question.question}</p>
                </div>
                {answer.score !== null && (
                  <div
                    className={`text-lg font-bold flex-shrink-0 ${
                      answer.score >= 7
                        ? "text-green-600"
                        : answer.score >= 4
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {answer.score.toFixed(1)}
                  </div>
                )}
              </div>

              {answer.score !== null && (
                <Progress value={(answer.score / 10) * 100} className="h-1" />
              )}

              <div className="bg-muted/50 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Your answer</p>
                <p className="text-sm">{answer.answer}</p>
              </div>

              {answer.feedback && (
                <div className="text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 inline mr-1 text-primary" />
                  {answer.feedback}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/tracks" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <Brain className="h-4 w-4" />
            Practice Again
          </Button>
        </Link>
        <Link href="/dashboard/analytics" className="flex-1">
          <Button className="w-full gap-2">
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
}
