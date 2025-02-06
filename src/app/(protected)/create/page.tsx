"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import Image from "next/image";
import { Button } from "~/components/ui/button";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  function onSubmit(data: FormInput) {
    window.alert(JSON.stringify(data, null, 2));
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
            {...register('projectName', { required: true })}
            placeholder="Project Name"
            required
          />
          <div className="h-2" />
         
          <Input
            {...register('repoUrl', { required: true })}
            placeholder="Github URL"
            type="url"
            required
          />
          <div className="h-2" />
         
          <Input 
            {...register('githubToken')}
            placeholder="Github Token (Optional)"
          />
          <div className="h-4" />
          
          <Button type="submit" className="mt-4">Create Project</Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
