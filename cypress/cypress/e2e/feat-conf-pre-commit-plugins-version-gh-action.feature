Feature: Update version in package.json

  Background:
    Given I create a "public" repository named "semver-PR-{PR_NUMBER}-{TEST_KEY}"
    And I update the file "README.md" in the branch "main" with the content:
      """
      # Example GH action
      
      ```yml
      jobs:
        example:
          name: 🧹 Example GH action
          runs-on: ubuntu-latest
          steps:
            - name: Checkout
              uses: actions/checkout@v4
      
            - name: 🗒️ example gh action
              uses: {OWNER}/{REPO}@0.12.2
      ```
      """
    And I push the file "semver-config.yml" to the branch "main" with the content:
      """
      pre-commit:
        plugins:
          - file: update-version-readme-gh-action.js
      """
    And I push the file ".github/workflows/semver-test.yml" to the branch "main" with the content:
      """
      name: cangulo-actions/semver test
      on:
        push: 
          branches:
            - main
      
      jobs:
        test-semver:
          name: Release new version
          runs-on: ubuntu-latest
          steps:
            - name: checkout
              uses: actions/checkout@v4
              with:
                token: ${{ secrets.CANGULO_BOT_PUSH_COMMITS }} # required for pushing to main, it is a protected branch
      
            - name: Release new version
              uses: cangulo-actions/semver@<TARGET_BRANCH>
              with:
                configuration: semver-config.yml
                github-token: ${{ secrets.CANGULO_BOT_PUSH_COMMITS }}   # required for creating the GH release
      """

  Scenario: Merge a PR with a commit fixing something
    Given I create a branch named "feat-pre-commit-plugins-version-gh-action"
    And I commit "fix: commit that fixes something in the lambda1" modifying the file "src/lambda1/lambda1.py"
    And I create a PR with title "test pre commit plugins-version-gh-action"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the last commit message must be:
      """
      [skip ci] created release 0.0.1 - fix: commit that fixes something in the lambda1 (#1)
      
      ## patches:
      * fix: commit that fixes something in the lambda1 (#1)
      """
    And the last commit must be tagged with "0.0.1"
    And the file "README.md" must contain "{OWNER}/{REPO}@0.0.1"
