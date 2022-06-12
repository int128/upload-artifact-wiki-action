import * as core from '@actions/core'
import * as io from '@actions/io'
import * as glob from '@actions/glob'
import { promises as fs } from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as git from './git'

type Inputs = {
  path: string
  wikiUrl: string
  wikiBasePath: string
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const globber = await glob.create(inputs.path, { matchDirectories: false })
  const files = await globber.glob()
  core.info(`uploading ${files.length} artifact(s)`)

  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-artifact-wiki-'))
  core.info(`cloning wiki into ${workspace}`)
  await git.clone(workspace, inputs.wikiUrl, inputs.token)

  const wikiBasePath = path.join(workspace, inputs.wikiBasePath)
  core.info(`copying artifact(s) to ${wikiBasePath}`)
  for (const f of files) {
    await io.cp(f, wikiBasePath)
  }

  await git.status(workspace)
  await git.commit(workspace, 'upload-artifact-wiki')
  await git.push(workspace)
}
