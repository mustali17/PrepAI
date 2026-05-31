import { getInterviewSession } from "@/actions/interviews";
import { getQuestionsByTrack } from "@/actions/questions";
import { redirect } from "next/navigation";
import { InterviewSession } from "@/components/interviews/interview-session";
import { InterviewResults } from "@/components/interviews/interview-results";

interface InterviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { id } = await params;
  const session = await getInterviewSession(id);

  if (!session) redirect("/dashboard/interviews");

  if (session.status === "COMPLETED") {
    return <InterviewResults session={session} />;
  }

  const questions = await getQuestionsByTrack(session.trackId);
  const answeredIds = new Set(session.answers.map((a) => a.questionId));
  const remaining = questions.filter((q) => !answeredIds.has(q.id));

  return (
    <InterviewSession
      session={session}
      questions={remaining}
      answeredCount={session.answers.length}
      totalCount={questions.length}
    />
  );
}
