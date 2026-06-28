import { getInterviewSession, getSessionQuestions } from "@/actions/interviews";
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

  const questions = await getSessionQuestions(id);
  const answeredIds = new Set(
    session.answers.map((a) => a.questionId ?? a.practiceQuestionId)
  );
  const remaining = questions.filter((q) => !answeredIds.has(q.id));

  const title = session.track?.title ?? session.practiceSet?.title ?? "Practice Interview";
  const icon = session.track?.icon ?? "🎯";

  return (
    <InterviewSession
      session={{
        id: session.id,
        title,
        icon,
        trackId: session.trackId,
        practiceSetId: session.practiceSetId,
      }}
      questions={remaining}
      answeredCount={session.answers.length}
      totalCount={questions.length}
    />
  );
}
