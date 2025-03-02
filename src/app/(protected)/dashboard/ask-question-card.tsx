"use client";

import MDEditor from "@uiw/react-md-editor";
import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { BrainCircuit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import UseProject from "~/hooks/use-project";
import { askQuestion } from "./actions";
import { SourceCode } from "eslint";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import UseRefetch from "~/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = UseProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fileReferences, setFileReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");

  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFileReferences([]);
    e.preventDefault();
    if (!project?.id) return;
    // send the question to the backend
    setLoading(true);

    const { output, fileReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFileReferences(fileReferences);
    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  const refetch = UseRefetch();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <BrainCircuit size={40} />
              </DialogTitle>
              <Button
                disabled={saveAnswer.isPending}
                variant={"outline"}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      question,
                      answer,
                      fileReferences,
                      projectId: project!.id,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer saved successfully");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to save answer");
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          <MDEditor.Markdown
            source={answer}
            className="!h-full max-h-[40vh] max-w-[70vw] overflow-scroll"
          />
          <div className="h-4"></div>
          <CodeReferences fileReferences={fileReferences} />

          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="" onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the homepage?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Ask Katara.ai"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
