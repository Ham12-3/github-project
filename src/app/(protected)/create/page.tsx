"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  function onSubmit(data: FormInput) {
    window.alert(JSON.stringify(data));
    return true;
  }

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img
        src="/undraw_github.svg"
        alt="programming image"
        className="h-56 w-auto"
      />
      <div>
        <h1 className="text-2xl font-semibold">Link your Github Repository</h1>
        <p className="text-s text-muted-foreground">
          Enter the URL of your repository to link it to Katara.ai
        </p>
      </div>
      <div className="h-4"></div>

      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("repoUrl", { required: true })}
            placeholder="Repository URL"
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
