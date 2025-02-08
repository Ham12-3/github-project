import {GoogleGenerativeAI} from '@google/generative-ai'
import {Document} from '@langchain/core/documents'

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_API_KEY!
)


const model = genAI.getGenerativeModel({
    model:'gemini-2.0-flash'
}
)

export const aiSummariseCommit = async (diff: string) => {
  const prompt = `
You are an expert programmer tasked with summarizing a git diff for a commit message. Your goal is to provide a concise, informative, and technically accurate summary of the changes.

**Understanding the Git Diff Format:**

A git diff shows the changes made to files in a commit. Here's a breakdown:

* **Metadata Lines:** Each file's diff starts with metadata like:
    \`\`\`
    diff --git a/path/to/file.js b/path/to/file.js
    index old_hash..new_hash mode
    --- a/path/to/file.js
    +++ b/path/to/file.js
    \`\`\`
    This indicates the file changed, its old and new versions (identified by hashes), and any permission changes.

* **Context Lines:** Lines that *haven't* changed are included for context. They start with a space.

* **Added Lines:** Lines that were added start with a \`+\`.

* **Removed Lines:** Lines that were removed start with a \`-\`.

**Instructions for Summarization:**

* **Focus on Impact:** Prioritize summarizing the *effects* of the code changes. What functionality is affected? What bugs are fixed? What improvements are made?
* **Be Concise:** Commit messages should be brief. Use bullet points for multiple changes within a file or across files.
* **Group Related Changes:** If changes are related (e.g., a bug fix and its corresponding test), group them together in the summary.
* **File-Specific Summaries:** When multiple files are changed, summarize the changes under each filename using relative paths from the project root.
* **Renames and Moves:** Explicitly mention file renames or moves (e.g., "Renamed X to Y" or "Moved X from A to B").
* **Simple Changes:** For trivial changes (e.g., "Fixed typo"), the file name might not be necessary.
* **No Git Diff Explanations:** Do not explain the git diff format or the meaning of the \`+\` and \`-\` signs—assume the reader understands them.
* **Technical Terms:** Use appropriate technical terminology.
* **Large Diffs:** Focus on the most significant changes if the diff is extensive. It's better to summarize the key changes well than to try to cover every minor detail.
* **No Changes:** If the diff shows no meaningful code changes (such as only whitespace changes), indicate something like "No significant changes."

**Example Summary:**

\`\`\`
* Fixed a bug causing incorrect calculation of totals in \`server/models/order.js\`
* Added unit tests for new order processing logic in \`test/order.test.js\`
* Updated dependencies in \`package.json\`
\`\`\`

Below is the actual diff for this commit:

${diff}

Please ensure your summary integrates all of the above information with reference to the provided diff.
  `;

  const response = await model.generateContent([prompt]);
  return response.response.text().trim();
};

export async function summariseCode(doc: Document) {
  console.log("Getting summary for", doc.metadata.source);
  const code = doc.pageContent.slice(0, 1000);

  const prompt = `
You are a seasoned senior software engineer with a talent for onboarding junior engineers. Analyze the code snippet from the file located at "${doc.metadata.source}" below:

----------------
${code}
----------------

Provide a comprehensive summary that includes:
- An overview of the file's purpose and functionality.
- Key structural components and design patterns used.
- Suggestions for potential improvements or refactoring.
- Any critical observations to aid in maintaining or understanding the code.

Ensure the summary is both detailed and concise.
`;

  const response = await model.generateContent([prompt]);
  return response.response.text().trim();
}



export async function generateEmbedding(summary: string) {
    const model = genAI.getGenerativeModel({
        model: "text-embedding-004"
    })

    const result = await model.embedContent(summary)
    const embedding = result.embedding
    return embedding.values
}

console.log(await generateEmbedding("Hello World"))