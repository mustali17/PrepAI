import { getUserPracticeSets } from "@/actions/practice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Sparkles, Brain, Users } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import { PracticeSetDialog } from "@/components/practice/practice-set-dialog";
import { StartInterviewButton } from "@/components/interviews/start-interview-button";
import { DeletePracticeSetButton } from "@/components/practice/delete-practice-set-button";

export default async function PracticePage() {
  const practiceSets = await getUserPracticeSets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Practice from Job Description</h1>
          <p className="text-muted-foreground">
            Upload your resume and a job description — AI generates questions tailored to that
            exact role.
          </p>
        </div>
        <PracticeSetDialog>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            New Practice Set
          </Button>
        </PracticeSetDialog>
      </div>

      {practiceSets.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No practice sets yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Paste a job description and upload your resume to get a personalized question set.
            </p>
            <PracticeSetDialog>
              <Button>Create your first practice set</Button>
            </PracticeSetDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {practiceSets.map((set) => (
            <Card key={set.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg line-clamp-1">{set.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {truncate(set.jobDescription, 120)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    {set._count.questions} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {set._count.sessions} attempts
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Created {formatDate(set.createdAt)}
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <StartInterviewButton practiceSetId={set.id} label="Practice" />
                <DeletePracticeSetButton practiceSetId={set.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
