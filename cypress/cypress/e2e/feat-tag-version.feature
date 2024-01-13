Feature: tag-repo-version disabled

  Background: The GH action runs is set with the default configuration
    Given I create a "public" repository named "semver-PR-{PR_NUMBER}-{TEST_KEY}"
    And I add a branch protection rule for "main" 
    And I push the file "semver-config.yml" to the branch "main" with the content:
      """
      scopes:
        list:
          - key: src
            files:
            - "src/**"
            versioning:
              file: src/version.json     
              changelog: src/CHANGELOG.md
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
          steps:
            - name: checkout
              uses: actions/checkout@v4
              with:
                token: ${{ secrets.CANGULO_BOT_PUSH_COMMITS }} # required for pushing to main, it is a protected branch
      
            - name: Release new version
              uses: cangulo-actions/semver@<TARGET_BRANCH>
              with:
                configuration: semver-config.yml
                tag-version: false                            # we don't want to create a tag for the whole repo. We only want tags for the scopes.
      """

  Scenario: Merge a PR with a commit fixing something
    Given I create a branch named "commits-with-scope"
    And I commit "fix(src): commit that fixes the lambda1" modifying the file "src/lambda1.py"
    And I commit "fix(tfm): commit that fixes the database" modifying the file "terraform/db.tf"
    And I commit "ci: trigger deployment" modifying the file "conf/dev/main.tfvars"
    And I create a PR with title "Fix lambda and database"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the last commit message must start with "[skip ci] created release 0.0.1"
    And the repository must have "2" tags 
    And the last commit must be tagged with:
      | <tag>     |
      | tfm-0.0.1 |
      | src-0.0.1 |
