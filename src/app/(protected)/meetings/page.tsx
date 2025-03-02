"use client";

import React from "react";
import UseProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";

const MeetingsPage = () => {
  const { projectId } = UseProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    {
      projectId,
    },
    {
      refetchInterval: 4000,
    },
  );
  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>

      <h1 className="text-xl font-semibold">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No meetings found</div>}
      {isLoading && <div>Loading...</div>}

      <ul className="divide-y divide-gray-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div>
              <div className="min-w-0">
                <div className="fex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" && (
                    <Badge className="bg-yellow-500 text-white">
                      Processing....
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MeetingsPage;
