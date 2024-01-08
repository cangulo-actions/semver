Feature: Smoke tests

  Background: No semver files nor tags. The GH action runs is set with the default configuration
    Given I create a repository named "semver-PR-{PR_NUMBER}-smoke-test"
    And the file ".github/workflows/semver-test.yml" is created with the content:
      """
      name: Test cangulo-actions/semver@<TARGET_BRANCH> action on <CURRENT_TIME>
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
      
            - name: Release new version
              uses: cangulo-actions/semver@<TARGET_BRANCH>
      """

  Scenario: Merge a PR with a commit fixing something
    Given I create a branch named "smoke-test"
    And I commit "fix: commit that fixes something in the lambda1" modifying the file "src/lambda1/lambda1.py"
    And I create a PR with title "semver smoke test"
    When I merge it
  #   Then the workflow "Test semver" must conclude in "success"
  #   And the repository must have the tag "0.0.1"
  #   And the last commit message must start with "[skip ci] created release 0.0.1"
