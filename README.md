# pull-request

Super simple, and fast GitHub action to create and update pull requests.

## Inputs

### `title`

Title of the pull-request.

### `body`

Body of the pull-request.

### `head`

Name of branch to be merged into the base and create or update pull-request for.

### `base`

Name of the branch that the pull-request will be merged into.

### `draft`

Whether or not the pull-request should be opened as a draft.

Defaults to `false`.

### `assignee`

Github user to assign to pull-request

## Outputs

### `pull-number`

Pull request number.

## Example Usage

```
- name: pull-request
  uses: TheRealWaldo/pull-request@v0.1.3
  with:
    json-opts: '{"dry-run": true}'
```
