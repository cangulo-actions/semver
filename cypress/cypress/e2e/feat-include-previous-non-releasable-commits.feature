Feature: Include previous non-releasable commits

  Background: The GH action runs is set and a non releasable commit was merged (docs: updated readme)
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
                include-previous-non-releasable-commits: true
      """
    And I create a branch named "fix-lambda1"
    And I commit "fix: lambda1 updated" modifying the file "src/lambda1/lambda1.py"
    And I create a PR with title "fix lambda1"
    And I merge it
    And the workflow "cangulo-actions/semver test" must conclude in "success"
    And I create a branch named "non-releasable-commits"
    And I commit "docs: updated readme" modifying the file "readme.md"    
    And I create a PR with title "Updated docs"
    And I merge it
    And the workflow "cangulo-actions/semver test" must conclude in "success"

  Scenario: Merge a PR with a commit fixing something
    Given I create a branch named "fix-lambda2"
    And I commit "fix: lambda2 updated" modifying the file "src/lambda2/lambda2.py"
    And I create a PR with title "fixed lambda2"
    And I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the last commit message must start with "[skip ci] created release 0.0.2"
    And the last commit message contain "docs: updated readme"
