Feature: Create GH release with no scopes configured

  Background: 
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
              with:
                print-summary: true
                create-gh-release: true
                github-token: ${{ secrets.CANGULO_BOT_PUSH_COMMITS }}   # required for creating the GH release
                tag-prefix: "v"
      """

  Scenario: Merge a PR with a commit adding a new feature
    Given I create a branch named "feat-gh-release"
    And I commit "feat: new feature for creating reports" modifying the file "src/reports.py"
    And I create a PR with title "reporting feature"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    And the repository must have "1" gh release
    And the only gh release must have the tag "v0.1.0"
    And the only gh release must have the title "0.1.0 feat: new feature for creating reports (#1)"
    And the only gh release must have the body:
      """
      ## new features:
      * feat: new feature for creating reports (#1)
      
      """

