# Test 1

## conditions

* `main` has branch protection enabled
* `token` has repo permissions
* `user` not added to the repo

## workflow

```yml
name: 🚀 continuous-delivery

on:
  push:
    branches:
      - main

jobs:
  semver:
    name: 🚀 release new version
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4.1.1
      with:
        token: ${{ secrets.TOKEN_FOR_PUSH_TO_PROTECTED_BRANCH }}
      

    - name: release new version
      uses: cangulo-actions/semver@main
      id: semver
      with:
        create-gh-release: true
        print-summary: true
        print-annotations: true
```

## Error

> remote: Permission to cangulo-actions/CrazyActionsTests-semver-1.git denied to cangulo-bot.

![error](error.png)

## Links

[workflow executed link](https://github.com/cangulo-actions/CrazyActionsTests-semver-1/actions/runs/7495965476/job/20407094766)