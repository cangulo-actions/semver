Feature: Smoke tests

  Background: The GH action runs is set with the default configuration
    Given I create a "public" repository named "semver-PR-{PR_NUMBER}-{TEST_KEY}"
    And I add a branch protection rule for "main" 
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
      """

  Scenario: Merge a PR with a commit fixing something
    Given I create a branch named "smoke-test"
    And I commit "fix: commit that fixes something in the lambda1" modifying the file "src/lambda1/lambda1.py"
    And I create a PR with title "semver smoke test"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the last commit message must be:
      """
      [skip ci] created release 0.0.1 - fix: commit that fixes something in the lambda1 (#1)
      
      ## patches:
      * fix: commit that fixes something in the lambda1 (#1)
      """
    And the last commit must be tagged with "0.0.1"
