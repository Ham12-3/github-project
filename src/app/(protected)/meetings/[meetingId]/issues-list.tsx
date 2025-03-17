"use client";

import { VideoIcon } from "lucide-react";
import { useState } from "react";
import { AlertDialogHeader } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api, RouterOutputs } from "~/trpc/react";

type Props = {
  meetingId: string;
};

// Define the expected Meeting type
type Meeting = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  meetingUrl: string;
  projectId: string;
  status: "PROCESSING" | "COMPLETED";
  issues: {
    id: string;
    meetingId: string;
    createdAt: Date;
    updatedAt: Date;
    summary: string;
    start: string;
    end: string;
    gist: string;
    headline: string;
  }[];
};

const IssuesList = ({ meetingId }: Props) => {
  const { data: meetingData, isLoading } = api.project.getMeetingById.useQuery(
    { meetingId },
    { refetchInterval: 4000 },
  );

  if (isLoading || !meetingData) return <div>Loading....</div>;

  // Use type assertion to help TypeScript understand the structure
  const meeting = meetingData as Meeting;

  return (
    <>
      <div className="p-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-6 lg:pb-8">
          <div className="flex items-center gap-x-6">
            <div className="rounded-full border bg-white p-3">
              <VideoIcon />
            </div>

            <h1>
              <div className="text-sm leading-6 text-gray-600">
                meeting on {meeting.createdAt.toLocaleDateString()}
              </div>

              <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                {meeting.name}
              </div>
            </h1>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {meeting.issues?.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </>
  );
};

function IssueCard({
  issue,
}: {
  issue: Meeting["issues"][number]; // This uses the type from your Meeting definition
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{issue.gist}</DialogTitle>

            <DialogDescription>
              {issue.createdAt.toLocaleDateString()}
            </DialogDescription>
            <p className="text-gray-600">{issue.headline}</p>
            <blockquote className="border-1-4 mt-2 border-gray-300 bg-gray-50 p-4">
              <span className="text-sm text-gray-600">
                {issue.start} - {issue.end}
              </span>
              <p className="font-medium italic leading-relaxed text-gray-900">
                {issue.summary}
              </p>
            </blockquote>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">{issue.gist}</CardTitle>
          <div className="border-b"></div>
          <CardDescription>{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)}>View Details</Button>
        </CardContent>
      </Card>
    </>
  );
}

export default IssuesList;
