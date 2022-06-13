# upload-artifact-wiki-action [![ts](https://github.com/int128/upload-artifact-wiki-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/upload-artifact-wiki-action/actions/workflows/ts.yaml)

This is an action to upload artifact(s) to GitHub Wiki.


## Getting Started

To upload an artifact:

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
          post: |
            ## Screenshot
            <img width="128" src="${{ steps.upload-artifact-wiki.outputs.url }}/screenshot.png">
```


## Specification

### Inputs

| Name | Default | Description
|------|----------|------------
| `path` | (required) | Path to artifact(s)
| `token` | `github.token` | Token for git operations


### Outputs

| Name | Description
|------|------------
| `url` | URL of GitHub Wiki
