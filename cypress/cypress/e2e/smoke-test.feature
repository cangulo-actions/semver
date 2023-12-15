Feature: Smoke tests

  @smoke
  Scenario: Merge a PR with a commit fixing something
    Given I checkout a branch
    And I commit the next change "fix: commit that fixes something"
    When I create a PR and merge it
    Then the CD workflow triggered must succeed
    And the release commit created includes the tag "0.0.1"
