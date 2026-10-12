# semver

GitHub Action, written in TypeScript, that will compute the next semantic
version of a repository from its Conventional Commits.

> [!NOTE]
>
> This is the initial scaffold: the action currently only greets. The semver
> logic is tracked in the M1 · Foundation milestone.

## Usage

```yaml
steps:
  - name: Run semver
    id: semver
    uses: cangulo-actions/semver@main
    with:
      who-to-greet: Carlos

  - name: Print output
    run: echo "${{ steps.semver.outputs.message }}" # Hello Carlos
```

## Inputs

| Name           | Required | Default | Description  |
| -------------- | -------- | ------- | ------------ |
| `who-to-greet` | no       | `World` | Who to greet |

## Outputs

| Name      | Description                          |
| --------- | ------------------------------------ |
| `message` | The greeting, `Hello <who-to-greet>` |

## Development

The toolchain follows
[actions/typescript-action](https://github.com/actions/typescript-action):
TypeScript, Jest, ESLint + Prettier, and a Rollup bundle committed to `dist/`.

```bash
npm install
npm run all   # format, lint, test and bundle
```

`dist/` must be committed: GitHub runs `dist/index.js` when the action is used.
The `check-dist` job fails if it is out of date.

To run the action locally with
[`@github/local-action`](https://github.com/github/local-action), copy
`.env.example` to `.env` and run `npm run local-action`.

## CI

[`pull-request.yml`](.github/workflows/pull-request.yml) runs on every pull
request:

- `ci`: format check, lint and unit tests.
- `check-dist`: re-bundles and fails if `dist/` differs.
- `test-action`: runs the action with `uses: ./` and asserts its output.
