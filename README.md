# upload-artifact-wiki-action [![ts](https://github.com/int128/upload-artifact-wiki-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/upload-artifact-wiki-action/actions/workflows/ts.yaml)

This is an action to upload artifact(s) to GitHub Wiki.


## Getting Started

To upload an artifact to GitHub Wiki:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # something to generate an artifact
      - run: convert 'logo:' screenshot.png

      # upload the artifact
      - uses: int128/upload-artifact-wiki-action@v1
        id: upload-artifact-wiki-action
        with:
          path: screenshot.png

      # post a comment with it
      - uses: int128/comment-action@v1
        with:
          update-if-exists: replace
          post: |
            ## Screenshot
            <img width="128" src="${{ steps.upload-artifact-wiki.outputs.url }}/screenshot.png">
```

### Artifact URL

For pull request event, this action uploads artifact(s) to the directory in form of `refs-pulls-NUMBER-merge`.
For example, it is called when a pull request `#123` is opened, you can get it from `https://github.com/OWNER/REPO/wiki/refs-pulls-123-merge/screenshot.png`

For push event or others, this action uploads artifact(s) to the directory of branch or tag name.
For example, it is called on main branch, you can get the artifact from `https://github.com/OWNER/REPO/wiki/main/screenshot.png`.

You can get the artifact URL from `url` of the outputs.


## Specification

### Inputs

| Name | Default | Description
|------|----------|------------
| `path` | (required) | Path to artifact(s) in glob pattern
| `token` | `github.token` | Token for git operations


### Outputs

| Name | Description
|------|------------
| `url` | URL of GitHub Wiki
