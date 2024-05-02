import { getBaseDirectory, getWiki } from '../src/run.js'

describe('getBaseDirectory returns a directory corresponding to context', () => {
  test('on pull request', () => {
    const directory = getBaseDirectory({
      repo: { owner: 'owner', repo: 'repo' },
      ref: 'refs/pulls/123/merge',
      sha: '0123456789012345678901234567890123456789',
      serverUrl: 'https://github.com',
    })
    expect(directory).toBe('refs-pulls-123-merge')
  })

  test('on push', () => {
    const directory = getBaseDirectory({
      repo: { owner: 'owner', repo: 'repo' },
      ref: 'refs/heads/main',
      sha: '0123456789',
      serverUrl: 'https://github.com',
    })
    expect(directory).toBe('main')
  })
})

test('getWiki', () => {
  const wiki = getWiki({
    repo: { owner: 'owner', repo: 'repo' },
    ref: 'refs/heads/main',
    sha: '0123456789',
    serverUrl: 'https://github.com',
  })
  expect(wiki).toStrictEqual({
    repository: 'https://github.com/owner/repo.wiki.git',
    baseDirectory: 'main',
    url: 'https://github.com/owner/repo/wiki/main',
  })
})
