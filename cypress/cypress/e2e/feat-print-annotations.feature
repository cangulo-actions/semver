Feature: Print Annotations

  Background: 
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
              with:
                print-annotations: true
      """

  Scenario: Merge a PR with a breaking change
    Given I create a branch named "feat-print-annotations"
    And I commit "break: changed API structure" modifying the file "api.tf"
    And I create a PR with title "changed API structure"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the next annotation must be listed:
      | <title>                       | <message>               | <annotation_level> |
      | cangulo-actions/semver result | Version 1.0.0 released! | notice             |
