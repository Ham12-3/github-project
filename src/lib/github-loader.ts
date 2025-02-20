import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "~/server/db";

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
  branch?: string, // Optional branch parameter
): Promise<Document[]> => {
  const chosenBranch = branch || "master";
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: chosenBranch,
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  try {
    const docs = await loader.load();
    return docs;
  } catch (error: any) {
    // if the error indicates there's no commit for the ref and we're not already trying "main", fallback
    if (
      error.message.includes("No commit found for the ref") &&
      chosenBranch === "master"
    ) {
      console.warn(
        "No commits found for branch 'master', trying branch 'main'",
      );
      return loadGithubRepo(githubUrl, githubToken, "main");
    }
    throw error;
  }
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`processing ${index} of ${allEmbeddings.length}`);
      if (!embedding) return;
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary || "",
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });
      await db.$executeRaw`
       UPDATE "SourceCodeEmbedding"
       SET "summaryEmbedding" = ${embedding.embedding}::vector
       WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary || "");
      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};
