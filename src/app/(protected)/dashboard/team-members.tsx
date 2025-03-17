"use client";

import React from "react";
import UseProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

const TeamMembers = () => {
  const { projectId } = UseProject();

  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });
  return (
    <div className="flex items-center gap-2">
      {members?.map((member) => (
        <Avatar key={member.id}>
          <AvatarImage
            src={member.imageUrl || ""}
            alt={`${member.firstName || "Team"} ${member.lastName || "Member"}`}
          />
          <AvatarFallback>{member.firstName?.[0] || "?"}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
};

export default TeamMembers;
