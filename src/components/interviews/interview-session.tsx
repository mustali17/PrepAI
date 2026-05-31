"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { evaluateAnswer, generateInterviewSummary } from "@/actions/ai";
import { submitAnswer, completeInterview, abandonInterview } from "@/actions/interviews";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Send,
  SkipForward,
  CheckCircle,
  AlertCircle,
  Loader2,
  XCircle,
  MessageSquare,
  Target,
} from "lucide-react";
import { getDifficultyColor } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tags: string[];
}

interface SessionProps {
  session: {
    id: string;
    trackId: string;
    track: { title: string; icon: string | null };
    answers: Array<{
      questionId: string;
      answer: string;
      score: number | null;
      question: { question: string };
    }>;
  };
  questions: Question[];
  answeredCount: number;
  totalCount: number;
}

type EvalResult = {
  score: number;
  feedback: string;
  suggestions: string[];
  technicalAccuracy: number;
  communication: number;
  completeness: number;
};

export function InterviewSession({
  session,
  questions,
  answeredCount,
  totalCount,
}: SessionProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvalResult | null>(null);
  const [isEvaluating, startEvaluating] = useTransition();
  const [isCompleting, startCompleting] = useTransition();
  const [localAnsweredCount, setLocalAnsweredCount] = useState(answeredCount);

  const currentQuestion = questions[currentIdx];
  const progress = (localAnsweredCount / totalCount) * 100;
  const isLastQuestion = currentIdx === questions.length - 1;

  const handleSubmitAnswer = () => {
    if (!answer.trim() || !currentQuestion) return;
    startEvaluating(async () => {
      const result = await evaluateAnswer(
        currentQuestion.question,
        answer,
        currentQuestion.category
      );
      setEvaluation(result);
      await submitAnswer(
        session.id,
        currentQuestion.id,
        answer,
        result.score,
        result.feedback,
        result.suggestions
      );
      setLocalAnsweredCount((c) => c + 1);
    });
  };

  const handleNext = () => {
    setAnswer("");
    setEvaluation(null);
    setCurrentIdx((i) => i + 1);
  };

  const handleComplete = () => {
    startCompleting(async () => {
      const allAnswers = session.answers.map((a) => ({
        question: a.question.question,
        answer: a.answer,
        score: a.score,
      }));
      const summary = await generateInterviewSummary(allAnswers);
      await completeInterview(
        session.id,
        summary.overallScore,
        summary.summary,
        summary.weakAreas,
        summary.strongAreas
      );
      router.push(`/dashboard/interviews/${session.id}`);
    });
  };

  const handleAbandon = async () => {
    if (!confirm("Abandon this interview? Progress will be saved.")) return;
    await abandonInterview(session.id);
    router.push("/dashboard/interviews");
  };

  if (!currentQuestion && questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">All questions answered!</h2>
            <p className="text-muted-foreground mb-6">
              Ready to complete your interview and get your final score?
            </p>
            <Button onClick={handleComplete} disabled={isCompleting} size="lg" className="gap-2">
              {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCompleting ? "Generating AI Report..." : "Complete & Get Results"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{session.track.icon ?? "🎯"}</span>
            <h1 className="text-xl font-bold">{session.track.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Question {localAnsweredCount + 1} of {totalCount}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleAbandon} className="text-muted-foreground">
          <XCircle className="h-4 w-4 mr-1" />
          Abandon
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {localAnsweredCount}/{totalCount} completed
        </p>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(currentQuestion.difficulty)} variant="outline">
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="secondary">{currentQuestion.category}</Badge>
              {currentQuestion.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-lg font-medium leading-relaxed">
              <MessageSquare className="h-5 w-5 inline mr-2 text-primary" />
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {!evaluation ? (
              <Textarea
                placeholder="Type your answer here. Be thorough and explain your reasoning..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[180px] resize-none"
                disabled={isEvaluating}
              />
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1 text-muted-foreground">Your answer</p>
                  <p className="text-sm">{answer}</p>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Technical", value: evaluation.technicalAccuracy },
                    { label: "Communication", value: evaluation.communication },
                    { label: "Completeness", value: evaluation.completeness },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center p-3 rounded-lg border">
                      <div
                        className={`text-2xl font-bold ${
                          metric.value >= 7
                            ? "text-green-600"
                            : metric.value >= 4
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {metric.value.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Overall score */}
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg ${
                    evaluation.score >= 7
                      ? "bg-green-50 border border-green-200"
                      : evaluation.score >= 4
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <Target
                    className={`h-5 w-5 ${
                      evaluation.score >= 7
                        ? "text-green-600"
                        : evaluation.score >= 4
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  />
                  <div>
                    <p className="font-semibold">
                      Overall Score: {evaluation.score.toFixed(1)}/10
                    </p>
                    <p className="text-sm">{evaluation.feedback}</p>
                  </div>
                </div>

                {/* Suggestions */}
                {evaluation.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Brain className="h-4 w-4 text-primary" />
                      AI Suggestions
                    </p>
                    <ul className="space-y-1">
                      {evaluation.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            {!evaluation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || isEvaluating}
                className="flex-1 gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Answer
                  </>
                )}
              </Button>
            ) : isLastQuestion ? (
              <Button onClick={handleComplete} disabled={isCompleting} className="flex-1 gap-2">
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete Interview
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1 gap-2">
                <SkipForward className="h-4 w-4" />
                Next Question
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
