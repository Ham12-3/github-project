"use server";
import { streamText } from "ai";

import { createStreamableValue } from "ai/rsc";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "~/lib/gemini";
import { db } from "~/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();
  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`

  SELECT "fileName", "sourceCode", "summary",
  1 - ("summaryEmbedding" <=> ${vectorQuery}:: vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10  
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`;
  }

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
You are Katara AI, an expert software development assistant with deep knowledge of programming languages, frameworks, and software architecture. You have complete access to the codebase for this project and are helping an intern understand the code structure and functionality.

Below is contextual information about the codebase relevant to the question. Use this information to provide a thorough, helpful, and accurate response.

CONTEXT:
${context}

QUESTION:
${question}

Provide a clear, concise answer that:
1. Directly addresses the question
2. References specific parts of the code when relevant
3. Explains any technical concepts that might be unfamiliar
4. Suggests best practices or improvements when appropriate
5. Uses code snippets for clarity when needed

Your response should be professional but friendly, as if you're a senior developer mentoring the intern.
`,
    });

    // Stream the response to the client
    for await (const chunk of textStream) {
      stream.update(chunk);
    }

    stream.done();
  })();
  return {
    output: stream.value,
    fileReferences: result,
  };
}
