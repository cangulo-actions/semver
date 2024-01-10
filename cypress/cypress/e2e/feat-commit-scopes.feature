Feature: Commits with scope

  Background: The GH action runs is set with the default configuration
    Given I create a repository named "semver-PR-{PR_NUMBER}-{TEST_KEY}"
    And I push the file "semver-config.yml" to the branch "main" with the content:
      """
      scopes:
        - key: src
          files:
          - "src/**"
        - key: tfm
          files:
          - "terraform/**"
          versioning:
              file: terraform/version.json
              changelog: terraform/CHANGELOG.md
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
          permissions:
            contents: write
          steps:
            - name: checkout
              uses: actions/checkout@v4
      
            - name: Release new version
              uses: cangulo-actions/semver@<TARGET_BRANCH>
              with:
                configuration: semver-config.yml
      """

  Scenario: Merge a PR with a commit fixing something
    Given I create a branch named "commits-with-scope"
    And I commit "fix(src): commit that fixes the lambda1" modifying the file "src/lambda1.py"
    And I commit "fix(tfm): commit that fixes the database" modifying the file "terraform/db.tf"
    And I create a PR with title "Fix lambda and database"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the last commit message must start with "[skip ci] created release 0.0.1"
    And the last commit must be tagged with:
      | <tag>     |
      |     0.0.1 |
      | tfm-0.0.1 |
      | src-0.0.1 |
