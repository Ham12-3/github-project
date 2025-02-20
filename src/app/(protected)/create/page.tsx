"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import UseRefetch from "~/hooks/use-refetch";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = UseRefetch();

  function onSubmit(data: FormInput) {
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch();
        },
        onError: (error) => {
          console.error("Error creating project:", error);
          toast.error("Failed to create projects");
        },
      },
    );
    return true;
  }

  return (
    <div className="flex h-full items-center justify-center gap-8">
      <Image
        src="/undraw_github.svg"
        alt="programming image"
        width={180}
        height={180}
        className=""
      />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold">Link your Github Repository</h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to Katara.ai
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("projectName", { required: true })}
            placeholder="Project Name"
            required
          />
          <div className="h-2" />

          <Input
            {...register("repoUrl", { required: true })}
            placeholder="Github URL"
            type="url"
            required
          />
          <div className="h-2" />

          <Input
            {...register("githubToken")}
            placeholder="Github Token (Optional)"
          />
          <div className="h-4" />

          <Button
            type="submit"
            className="mt-4"
            disabled={createProject.isPending}
          >
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
