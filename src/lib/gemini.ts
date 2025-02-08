import {GoogleGenerativeAI} from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_API_KEY!
)


const model = genAI.getGenerativeModel({
    model:'gemini-2.0-flash'
}
)

export const aiSummariseCommit = async (diff: string) => {
    const response = await model.generateContent([
       `You are an expert programmer tasked with summarizing a git diff for a commit message.  Your goal is to provide a concise, informative, and technically accurate summary of the changes.
  
  **Understanding the Git Diff Format:**
  
  A git diff shows the changes made to files in a commit.  Here's a breakdown:
  
  * **Metadata Lines:** Each file's diff starts with metadata like:
      \`\`\`
      diff --git a/path/to/file.js b/path/to/file.js
      index old_hash..new_hash mode
      --- a/path/to/file.js
      +++ b/path/to/file.js
      \`\`\`
      This indicates the file changed, its old and new versions (identified by hashes), and the change in permissions.
  
  * **Context Lines:** Lines that *haven't* changed are included for context. They start with a space.
  
  * **Added Lines:** Lines that were added start with a \`+\`.
  
  * **Removed Lines:** Lines that were removed start with a \`-\`.
  
  **Instructions for Summarization:**
  
  * **Focus on Impact:** Prioritize summarizing the *effects* of the code changes, not just the lines added or removed. What functionality is affected? What bugs are fixed? What improvements are made?
  * **Be Concise:** Commit messages should be brief. Avoid unnecessary details.  Use bullet points for multiple changes within a file or across files.
  * **Group Related Changes:** If changes are related (e.g., a bug fix and its corresponding test), group them together in the summary.
  * **File-Specific Summaries:** If multiple files are changed, summarize the changes in each file separately using bullet points under the filename.  Use relative paths from the project root.
  * **Renames and Moves:** Explicitly mention file renames (e.g., "Renamed X to Y") and moves (e.g., "Moved X from A to B").
  * **Simple Changes:** For trivial changes (e.g., "Fixed typo"), the file name might not be necessary.
  * **No Git Diff Explanations:** Do *not* explain the git diff format or the meaning of \`+\` and \`-\` signs. Assume the reader understands diffs.
  * **Technical Terms:** Use appropriate technical terms.
  * **Large Diffs:** If the diff is extensive, focus on the *most significant* changes.  It's better to summarize the key changes well than to try to cover everything superficially.
  * **No Changes:** If the diff shows no meaningful code changes (e.g., whitespace changes only), say "No significant changes." or similar.
  * **Example:**  A good summary might look like this:
  
      \`\`\`
      * Fixed a bug causing incorrect calculation of totals in \`server/models/order.js\`
      * Added unit tests for new order processing logic in \`test/order.test.js\`
      * Updated dependencies in \`package.json\`
      \`\`\`
  `,
     
    ]);
  
    return response.response.text(); // Trim whitespace from the response
  };

