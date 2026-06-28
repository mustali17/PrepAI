"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAnswer, completeInterview, abandonInterview } from "@/actions/interviews";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Send,
  SkipForward,
  CheckCircle,
  Loader2,
  XCircle,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { getDifficultyColor } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tags: string[];
}

interface SessionSource {
  trackId: string | null;
  practiceSetId: string | null;
}

interface SessionProps {
  session: {
    id: string;
    title: string;
    icon: string;
  } & SessionSource;
  questions: Question[];
  answeredCount: number;
  totalCount: number;
}

export function InterviewSession({ session, questions, answeredCount, totalCount }: SessionProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [isCompleting, startCompleting] = useTransition();
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [localAnsweredCount, setLocalAnsweredCount] = useState(answeredCount);
  const [allAnswered, setAllAnswered] = useState(answeredCount >= totalCount);

  const currentQuestion = questions[currentIdx];
  const progress = (localAnsweredCount / totalCount) * 100;

  const handleSubmitAnswer = () => {
    if (!answer.trim() || !currentQuestion) return;
    startSaving(async () => {
      await saveAnswer(session.id, { questionId: currentQuestion.id }, answer);
      const newCount = localAnsweredCount + 1;
      setLocalAnsweredCount(newCount);
      setAnswer("");

      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((i) => i + 1);
      } else {
        setAllAnswered(true);
      }
    });
  };

  const handleComplete = () => {
    setCompleteError(null);
    startCompleting(async () => {
      const result = await completeInterview(session.id);
      if (result?.error) {
        setCompleteError(result.error);
        return;
      }
      router.push(`/dashboard/interviews/${session.id}`);
    });
  };

  const handleAbandon = async () => {
    if (!confirm("Abandon this interview? Progress will be saved.")) return;
    await abandonInterview(session.id);
    router.push("/dashboard/interviews");
  };

  if (allAnswered || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">All questions answered!</h2>
            <p className="text-muted-foreground mb-6">
              All {totalCount} answers are saved. The AI will evaluate the entire interview
              together, as a whole, and generate your final report.
            </p>

            {completeError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mb-4 text-left">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {completeError}
              </div>
            )}

            <Button onClick={handleComplete} disabled={isCompleting} size="lg" className="gap-2">
              {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCompleting
                ? "AI is evaluating your interview..."
                : completeError
                ? "Try Again"
                : "Complete & Get Results"}
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
            <span className="text-lg">{session.icon}</span>
            <h1 className="text-xl font-bold">{session.title}</h1>
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
          {localAnsweredCount}/{totalCount} answered
        </p>
      </div>

      {/* Question Card */}
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
          <Textarea
            placeholder="Type your answer here. Be thorough and explain your reasoning..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[180px] resize-none"
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Your answer is saved now and evaluated by AI together with all other answers once
            you finish the interview.
          </p>
        </CardContent>

        <CardFooter>
          <Button onClick={handleSubmitAnswer} disabled={!answer.trim() || isSaving} className="flex-1 gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : currentIdx + 1 < questions.length ? (
              <>
                <SkipForward className="h-4 w-4" />
                Save &amp; Next Question
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Save Final Answer
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
