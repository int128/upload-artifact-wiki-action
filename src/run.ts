import { promises as fs } from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as io from '@actions/io'
import * as git from './git.js'
import type { Context } from './github.js'

type Inputs = {
  path: string
  token: string
}

type Outputs = {
  url: string
}

export const run = async (inputs: Inputs, context: Context): Promise<Outputs> => {
  const wiki = getWiki(context)

  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-artifact-wiki-'))
  core.info(`cloning ${wiki.repository} into ${workspace}`)
  await git.clone(workspace, wiki.repository, inputs.token)

  const globber = await glob.create(inputs.path, { matchDirectories: false })
  const files = await globber.glob()
  const destination = path.join(workspace, wiki.baseDirectory)
  core.info(`copying ${files.length} artifact(s) to ${destination}`)
  await copyFiles(files, destination)

  const status = await git.status(workspace)
  if (!status) {
    core.info('nothing to commit')
    core.info(`artifact(s) is published at ${wiki.url}`)
    return { url: wiki.url }
  }
  await git.commit(workspace, 'upload-artifact-wiki')
  await git.push(workspace)
  core.info(`artifact(s) is published at ${wiki.url}`)
  return { url: wiki.url }
}

export const getWiki = (context: Context) => {
  const baseDirectory = getBaseDirectory(context)
  return {
    repository: `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}.wiki.git`,
    baseDirectory,
    url: `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/wiki/${baseDirectory}`,
  }
}

export const getBaseDirectory = (context: Context) => {
  let ref = context.ref
  ref = ref.replace(/^refs\/heads\//, '')
  return ref.replaceAll('/', '-')
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
