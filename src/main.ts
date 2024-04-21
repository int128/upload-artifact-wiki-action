import * as core from '@actions/core'
import * as github from '@actions/github'
import { run } from './run.js'

const main = async (): Promise<void> => {
  const outputs = await run(
    {
      path: core.getInput('path', { required: true }),
      token: core.getInput('token', { required: true }),
    },
    github.context,
  )
  core.setOutput('url', outputs.url)
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
