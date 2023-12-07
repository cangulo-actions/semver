Feature: release version after a PR is merged

  Scenario: Merge PR with one commit
    Given the initial version is "<initialVersion>"
    And I checkout "<branchName>" branch
    When I commit the next change "<commitMsg>"
    And I create a PR
    And I merge it
    Then the CD workflow triggered must succeed
    And the version released is "<expectedVersion>"
    And there are "<totalVersion>" versions in the repository

    Examples: 
      | branchName                          | initialVersion | commitMsg                                     | expectedVersion | totalVersion |
      | semver-pr{SEMVER_PR_NUMBER}-1-fix   | none           | fix: commit that fixes something              |           0.0.1 |            1 |
      | semver-pr{SEMVER_PR_NUMBER}-1-ci    |          0.0.1 | ci: commit that won't trigger a release       |           0.0.1 |            1 |
      | semver-pr{SEMVER_PR_NUMBER}-1-feat  |          0.0.1 | feat: commit that adds a feature              |           0.1.0 |            2 |
      | semver-pr{SEMVER_PR_NUMBER}-1-break |          0.1.0 | break: commit that introduce a breking change |           1.0.0 |            3 |

  Scenario: Merge PR with multiple commits
    Given the initial version is "<initialVersion>"
    And I checkout "<branchName>" branch
    When I commit the next changes
      | ci: commit that fixes something               |
      | fix: commit that fixes something              |
      | feat: commit that adds a feature              |
      | break: commit that introduce a breking change |
    And I create a PR
    And I merge it
    Then the CD workflow triggered must succeed
    And the version released is "<expectedVersion>"
    And there are "<totalVersion>" versions in the repository

    Examples: 
      | branchName                            | initialVersion | expectedVersion | totalVersion |
      | semver-pr{SEMVER_PR_NUMBER}-4-commits |          1.0.0 |           2.0.0 |            4 |
