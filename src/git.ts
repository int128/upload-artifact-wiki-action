import * as core from '@actions/core'
import * as exec from '@actions/exec'

export const clone = async (cwd: string, url: string, token: string): Promise<void> => {
  await exec.exec('git', ['version'], { cwd })
  const credentials = Buffer.from(`x-access-token:${token}`).toString('base64')
  core.setSecret(credentials)
  await exec.exec(
    'git',
    [
      'clone',
      '--no-tags',
      '--config',
      `http.https://github.com/.extraheader=AUTHORIZATION: basic ${credentials}`,
      '--config',
      'gc.auto=0',
      '--config',
      'protocol.version=2',
      '--depth=1',
      '--no-recurse-submodules',
      '--',
      url,
      '.',
    ],
    { cwd }
  )
  await exec.exec('git', ['rev-parse', 'HEAD'], { cwd })
}

export const status = async (cwd: string): Promise<string> => {
  const output = await exec.getExecOutput('git', ['status', '--porcelain'], { cwd })
  return output.stdout
}

export const commit = async (cwd: string, message: string): Promise<void> => {
  await exec.exec('git', ['add', '.'], { cwd })
  await exec.exec('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd })
  await exec.exec('git', ['config', 'user.name', 'github-actions[bot]'], { cwd })
  await exec.exec('git', ['commit', '-m', message], { cwd })
}

export const push = async (cwd: string): Promise<number> => {
  return await exec.exec('git', ['push', 'origin'], { cwd })
}
