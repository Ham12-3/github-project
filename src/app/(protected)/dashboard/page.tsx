"use client";
import { useUser } from "@clerk/nextjs";
import { Github } from "lucide-react";
import React from "react";
import UseProject from "~/hooks/use-project";

const DashboardPage = () => {
 const {project} = UseProject()
  return (
  <div>
    <div className="flex itemss-center justify-center flex-wrap gap-y-4">

      <div className="w-fit rounded-md bg-primary px-4 py-3">
<Github className="size-5 text-white" />
      </div>

    </div>
  </div>
  );
};

export default DashboardPage;
