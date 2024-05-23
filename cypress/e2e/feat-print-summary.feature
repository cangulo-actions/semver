Feature: Print Summary

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
      """

  Scenario: Merge a PR with a breaking change
    Given I create a branch named "feat-print-summary"
    And I commit "break: changed API structure" modifying the file "api.tf"
    And I create a PR with title "changed API structure"
    When I merge it
    Then the workflow "cangulo-actions/semver test" must conclude in "success"
    # ⚠️🤷 THERE IS NO WAY TO CHECK THE SUMMARY IS LISTED USING THE GH API
