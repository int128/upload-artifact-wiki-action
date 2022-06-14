import { getBaseDirectory, getWiki } from '../src/run'

describe('getBaseDirectory returns a directory corresponding to context', () => {
  test('on pull request', () => {
    const directory = getBaseDirectory({
      eventName: 'pull_request',
      payload: {
        pull_request: {
          number: 123,
        },
      },
      repo: { owner: 'owner', repo: 'repo' },
      ref: 'refs/pulls/123/merge',
      sha: '0123456789012345678901234567890123456789',
      serverUrl: 'https://github.com',
    })
    expect(directory).toBe('pr-123/0123456789012345678901234567890123456789')
  })

  test('on push', () => {
    const directory = getBaseDirectory({
      eventName: 'push',
      payload: {},
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
    eventName: 'push',
    payload: {},
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
