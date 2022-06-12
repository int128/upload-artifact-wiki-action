import * as core from '@actions/core'
import * as exec from '@actions/exec'

export const clone = async (cwd: string, url: string, token: string): Promise<void> => {
  await exec.exec('git', ['version'], { cwd })
  await exec.exec('git', ['init'], { cwd })
  await exec.exec('git', ['remote', 'add', 'origin', url], { cwd })
  await exec.exec('git', ['config', '--local', 'gc.auto', '0'], { cwd })

  const credentials = Buffer.from(`x-access-token:${token}`).toString('base64')
  core.setSecret(credentials)
  await exec.exec(
    'git',
    ['config', '--local', 'http.https://github.com/.extraheader', `AUTHORIZATION: basic ${credentials}`],
    { cwd }
  )
  await exec.exec(
    'git',
    [
      '-c',
      'protocol.version=2',
      'fetch',
      '--no-tags',
      '--prune',
      '--no-recurse-submodules',
      '--depth=1',
      'origin',
      `+HEAD:refs/remotes/origin/HEAD`,
    ],
    { cwd }
  )
  await exec.exec('git', ['branch', '--list', '--remote', `origin/HEAD`], { cwd })
  await exec.exec('git', ['checkout', '--progress', '--force', 'HEAD'], { cwd })
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
  return await exec.exec('git', ['push', 'origin', `HEAD:refs/heads/HEAD`], { cwd })
}
