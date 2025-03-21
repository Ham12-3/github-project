"use client";

import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import UseProject from "~/hooks/use-project";

const InviteButton = () => {
  const { projectId } = UseProject();
  const [open, setOpen] = React.useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  // Only access window after component mounts (client-side only)
  useEffect(() => {
    setInviteUrl(`${window.location.origin}/join/${projectId}`);
  }, [projectId]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and paste this link
          </p>
          <Input
            className="mt-4"
            readOnly
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(inviteUrl);
              }
            }}
            value={inviteUrl}
          />
        </DialogContent>
      </Dialog>
      <Button size={"sm"} onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
