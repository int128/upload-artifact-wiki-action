import * as core from '@actions/core'
import * as io from '@actions/io'
import * as glob from '@actions/glob'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as git from './git'
import { Context as GitHubContext } from '@actions/github/lib/context'

type Inputs = {
  path: string
  token: string
}

type Outputs = {
  url: string
}

type Context = Pick<GitHubContext, 'repo' | 'serverUrl' | 'ref' | 'eventName' | 'payload'>

export const run = async (inputs: Inputs, context: Context): Promise<Outputs> => {
  const globber = await glob.create(inputs.path, { matchDirectories: false })
  const files = await globber.glob()
  core.info(`uploading ${files.length} artifact(s)`)

  const wikiRepository = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}.wiki.git`
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-artifact-wiki-'))
  core.info(`cloning ${wikiRepository} into ${workspace}`)
  await git.clone(workspace, wikiRepository, inputs.token)

  const wikiBaseDirectory = getBaseDirectory(context)
  const wikiBaseUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/wiki/${wikiBaseDirectory}`
  core.info(`artifact is published at ${wikiBaseUrl}`)

  const destination = path.join(workspace, wikiBaseDirectory)
  core.info(`copying artifact(s) to ${destination}`)
  await copyFiles(files, destination)

  const status = await git.status(workspace)
  if (!status) {
    core.info('nothing to commit')
    return { url: wikiBaseUrl }
  }
  await git.commit(workspace, 'upload-artifact-wiki')
  await git.push(workspace)
  return { url: wikiBaseUrl }
}

export const getBaseDirectory = (context: Context) => {
  if (context.eventName === 'pull_request') {
    return `pr-${context.payload.pull_request?.number ?? 0}`
  }
  return context.ref.replace(/^refs\/\w+\//, '')
}

const copyFiles = async (files: string[], destinationDirectory: string) => {
  for (const f of files) {
    const relativePath = path.relative('.', f)
    const destination = path.join(destinationDirectory, relativePath)
    await io.mkdirP(path.dirname(destination))
    await io.cp(f, destination)
    core.info(`${f} -> ${destination}`)
  }
}
