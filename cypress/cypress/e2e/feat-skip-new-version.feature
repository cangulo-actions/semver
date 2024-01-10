Feature: Skip create a new version when the commit type does not trigger a release

  Background: The GH action runs is set with the default configuration
    Given I create a repository named "semver-PR-{PR_NUMBER}-{TEST_KEY}"
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
          permissions:
            contents: write
          steps:
            - name: checkout
              uses: actions/checkout@v4
      
            - name: Release new version
              uses: cangulo-actions/semver@<TARGET_BRANCH>
      """

  Scenario: Merge a PR with a commit type that does not trigger a release
    Given I create a branch named "skip-new-version"
    And I commit "docs: updated readme" modifying the file "docs/notes.md"
    And I create a PR with title "Updated docs"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the last commit message must start with "docs: updated readme"
    And the repository must have "0" tags
