import * as core from '@actions/core'
import { getContext } from './github.js'
import { run } from './run.js'

const main = async (): Promise<void> => {
  const outputs = await run(
    {
      path: core.getInput('path', { required: true }),
      token: core.getInput('token', { required: true }),
    },
    getContext(),
  )
  core.setOutput('url', outputs.url)
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
