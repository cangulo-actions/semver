Feature: release version after a PR is merged

  Scenario: Merge a PR with one commit
    Given I checkout a branch
    And I commit the next change "<commitMsg>"
    When I create a PR with title "<prTitle>" and merge it
    Then the CD workflow triggered must succeed
    And the release commit created includes the tag "<releasedVersion>"

    Examples: 
      | commitMsg                                       | prTitle        | releasedVersion |
      | fix: commit that fixes something                |   1 fix commit |           0.0.1 |
      | ci: commit that won't trigger a release         |    1 ci commit | none            |
      | feat: commit that adds a feature                |  1 feat commit |           0.1.0 |
      | break: commit that introduces a breaking change | 1 break commit |           1.0.0 |

  Scenario: Merge a PR with multiple commits without scopes
    Given I checkout a branch
    And I commit the next changes
      | ci: commit that fixes something                |
      | fix: commit that fixes something               |
      | feat: commit that adds a feature               |
      | break: commit that introduce a breaking change |
    When I create a PR with title "multiple commits without scope" and merge it
    Then the CD workflow triggered must succeed
    And the release commit created includes the tag "<releasedVersion>"

    Examples: 
      | releasedVersion |
      |           2.0.0 |

  Scenario: Merge a PR with multiple commits with scopes
    Given I checkout a branch
    And I commit the next changes
      | ci(tfm): commit that fixes something in terraform    |
      | fix(src): commit that fixes something in the lambdas |
      | feat(tfm): commit that adds a feature in terraform   |
      | break: commit that introduce a breaking change       |
    When I create a PR with title "multiple commits with scope" and merge it
    Then the CD workflow triggered must succeed
    And the release commit created includes the next tags
      |     3.0.0 |
      | tfm-0.1.0 |
      | src-0.0.1 |
