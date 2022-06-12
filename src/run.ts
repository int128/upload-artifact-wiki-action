import * as core from '@actions/core'
import * as io from '@actions/io'
import * as github from '@actions/github'
import * as glob from '@actions/glob'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as git from './git'

type Inputs = {
  path: string
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const globber = await glob.create(inputs.path, { matchDirectories: false })
  const files = await globber.glob()
  core.info(`uploading ${files.length} artifact(s)`)

  const wikiRepository = `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}.wiki.git`
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-artifact-wiki-'))
  core.info(`cloning ${wikiRepository} into ${workspace}`)
  await git.clone(workspace, wikiRepository, inputs.token)

  const destination = path.join(workspace, getBaseDirectory())
  core.info(`copying artifact(s) to ${destination}`)
  await copyFiles(files, destination)

  const status = await git.status(workspace)
  if (!status) {
    core.info('nothing to commit')
    return
  }
  await git.commit(workspace, 'upload-artifact-wiki')
  await git.push(workspace)
}

const getBaseDirectory = () => {
  if (github.context.eventName === 'pull_request') {
    return `pr-${github.context.payload.pull_request?.number ?? 0}`
  }
  return github.context.ref.replace(/^refs\/\w+\//, '')
}

export const copyFiles = async (files: string[], destinationDirectory: string) => {
  for (const f of files) {
    const relativePath = path.relative('.', f)
    const destination = path.join(destinationDirectory, relativePath)
    await io.mkdirP(path.dirname(destination))
    await io.cp(f, destination)
    core.info(`${f} -> ${destination}`)
  }
}
