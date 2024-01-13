Feature: Create GH release with scopes configured

  Background: 
    Given I create a "public" repository named "semver-PR-{PR_NUMBER}-{TEST_KEY}"
    And I push the file "semver-config.yml" to the branch "main" with the content:
      """
      scopes:
        printSummary: true
        createGHRelease: true
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
          - key: conf-dev
            files:
            - "conf/dev/**"
            versioning:
              file: conf/dev/version.json
              changelog: conf/dev/CHANGELOG.md
              createGHRelease: false            # avoid creating GH release for this scope
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
                github-token: ${{ secrets.CANGULO_BOT_PUSH_COMMITS }}
      """

  Scenario: Merge a PR with a commit adding a new feature
    Given I create a branch named "feat-gh-release"
    And I commit "fix(src): commit that fixes the lambda1" modifying the file "src/lambda1.py"
    And I commit "fix(tfm): commit that fixes the database" modifying the file "terraform/db.tf"
    And I commit "fix(conf-dev): updated tfm configuration for dev" modifying the file "conf/dev/main.tfvars"
    And I create a PR with title "Fix lambda and database"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the repository must have "2" gh release
    And the gh releases are:
      | <name>                                 | <tag>     |
      | src-0.0.1 Fix lambda and database (#1) | src-0.0.1 |
      | tfm-0.0.1 Fix lambda and database (#1) | tfm-0.0.1 |
