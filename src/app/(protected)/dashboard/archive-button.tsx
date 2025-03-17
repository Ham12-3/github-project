"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import UseProject from "~/hooks/use-project";
import UseRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId } = UseProject();
  const refetch = UseRefetch();
  return (
    <Button
      disabled={archiveProject.isPending}
      size={"sm"}
      variant={"destructive"}
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project?",
        );

        if (confirm)
          archiveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project archived successfully");
                refetch();
              },
              onError: () => {
                toast.error("Failed to archive project");
              },
            },
          );
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
