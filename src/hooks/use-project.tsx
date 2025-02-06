import React from 'react'
import { api } from '~/trpc/react'
import {useLocalStorage} from 'usehooks-ts'

const UseProject = () => {

    const {data: projects} = api.project.getProjects.useQuery()
    const[projectId, setProjectId] = useLocalStorage('katara-ai-project', null)
    const project = projects?.find(project => project.id === projectId)


  return {
    projects,
    project,
    projectId,
    setProjectId
  }
}

export default UseProject