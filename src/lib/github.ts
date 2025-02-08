import { Octokit } from 'octokit'


import axios from 'axios'
import { db } from '~/server/db'
import { aiSummariseCommit } from './gemini'

export const  octokit = new Octokit({
    auth : process.env.GITHUB_TOKEN
})


const githubUrl = 'https://github.com/docker/genai-stack'


type Response =  {
commitHash: string;
commitMessage: string;
commitAuthorName: string;
commitAuthorAvatar:string;
commitDate: string
}


export const getCommitHashes = async(githubUrl: string) :Promise<Response[]>=> {
    console.log("[getCommitHashes] Fetching commit hashes for URL:", githubUrl);
    const [owner , repo] = githubUrl.split('/').slice(-2)

    if(!owner || !repo) {
        throw new Error("Invalid github url")
    }
    console.log("[getCommitHashes] Owner:", owner, "Repo:", repo);
    const {data} = await octokit.rest.repos.listCommits({
        owner,
        repo
    })

    console.log("[getCommitHashes] Total commits fetched:", data.length);

    const sortedCommits = data.sort((a:any, b:any)=>new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime() ) as any[]

    const selectedCommits = sortedCommits.slice(0, 15);
    console.log("[getCommitHashes] Selected commits (top 15):", selectedCommits.length);

    return selectedCommits.map((commit:any)=> ({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? ""   
    }))
}


export const pollCommits = async(projectId: string)=> {
    console.log("[pollCommits] Starting to poll commits for projectId:", projectId);

    const {project, githubUrl} = await fetchProjectGithubUrl(projectId)
    console.log("[pollCommits] Project found with GitHub URL:", githubUrl);

    const commitHashes = await getCommitHashes(githubUrl)
    console.log("[pollCommits] Total commit hashes fetched:", commitHashes.length);

    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes)
    console.log("[pollCommits] Unprocessed commits found:", unprocessedCommits.length);

    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(commit => {
        console.log(`[pollCommits] Summarising commit with hash: ${commit.commitHash}`);
        return summariseCommit(githubUrl, commit.commitHash)
    }))

    const summaries = summaryResponses.map((response)=> {
        if(response.status === 'fulfilled') {
            return response.value as string
        }
        console.error("[pollCommits] Summarisation failed for one commit:", response);
        return ""
    })

    console.log("[pollCommits] Creating commit records in the database for", summaries.length, "commits.");
    const commits = await db.commit.createMany({
        data: summaries.map((summary, index)=> {
            console.log(`[pollCommits] Processing commit index: ${index}, commit hash: ${unprocessedCommits[index]!.commitHash}`)   
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary
            }
        })
    })
    console.log("[pollCommits] Database records created for commits:", commits);
    return commits
}

async function summariseCommit(githubUrl: string, commitHash:string ) {
    console.log("[summariseCommit] Starting summarisation for commit:", commitHash);
    // get the diff , then pass the diff into ai 
    const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    })
    console.log("[summariseCommit] Diff fetched of length:", data.length, "for commit:", commitHash);

    const summary = await aiSummariseCommit(data) || ""
    console.log("[summariseCommit] Summary generated for commit:", commitHash);
    return summary
}

async function fetchProjectGithubUrl(projectId: string) {
    console.log("[fetchProjectGithubUrl] Fetching project GitHub URL for projectId:", projectId);

    const project = await db.project.findUnique({
        where: {id: projectId},
        select : {
            githubUrl: true
        }
    })

    if(!project?.githubUrl) {
        console.error("[fetchProjectGithubUrl] Project has no GitHub URL for projectId:", projectId);
        throw new Error("Project has no github url")
    }

    console.log("[fetchProjectGithubUrl] GitHub URL found:", project.githubUrl);
    return {project, githubUrl: project?.githubUrl}
}


async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    console.log("[filterUnprocessedCommits] Filtering processed commits for projectId:", projectId);
    const processedCommits = await db.commit.findMany({
        where: {
            projectId
        }
    })
    console.log("[filterUnprocessedCommits] Processed commits count:", processedCommits.length);

    const unprocessedCommits = commitHashes.filter((commit)=> !processedCommits.some((processedCommit)=> processedCommit.commitHash === commit.commitHash))
    console.log("[filterUnprocessedCommits] Unprocessed commits count:", unprocessedCommits.length);

    return unprocessedCommits

}

