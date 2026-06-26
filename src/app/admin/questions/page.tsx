/* eslint-disable @typescript-eslint/no-unused-vars */
import { getAllQuestions } from "@/actions/questions";
import { getAllTracksAdmin } from "@/actions/tracks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDifficultyColor } from "@/lib/utils";
import { QuestionDialog } from "@/components/admin/question-dialog";
import { DeleteQuestionButton } from "@/components/admin/delete-question-button";
import { Plus, HelpCircle } from "lucide-react";

export default async function AdminQuestionsPage() {
  const [questions, tracks] = await Promise.all([getAllQuestions(), getAllTracksAdmin()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Questions</h1>
          <p className="text-muted-foreground">{questions.length} questions in bank</p>
        </div>
        <QuestionDialog mode="create" tracks={tracks}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Question
          </Button>
        </QuestionDialog>
      </div>

      {questions.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No questions yet. Create the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 mb-2">{q.question}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {q.track.title}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {q.category}
                      </Badge>
                      <Badge className={`${getDifficultyColor(q.difficulty)} text-xs`} variant="outline">
                        {q.difficulty}
                      </Badge>
                      {q.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <QuestionDialog mode="edit" question={q} tracks={tracks}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </QuestionDialog>
                    {/* <DeleteQuestionButton questionId={q.id} /> */}
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
