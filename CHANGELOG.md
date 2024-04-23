# 0.13.2 fix: simplified schema, removed tag-prefix from scope configuration. system will rely on main tag-prefix provided (#116)

## patches:
* fix: simplified schema, removed tag-prefix from scope configuration. system will rely on main tag-prefix provided (#116)

# 0.13.1 fix: issue with input.tag-prefix. Now if a GH release is created it will target the tag with the prefix (#115)

## patches:
* fix: fix: issue with input.tag-prefix. Now if a GH release is created it will target the tag with the prefix
* fix: plugin [update-version-readme-gh-action] updated to include tag prefix
## others
* test: updated e2e test

# 0.13.0 feat: #30 INIT JS plugins (#114)

## new features:
* feat: #30 Added plugin for GH actions repository. Now you can update the version in the ` README.md` by enabling the `update-version-readme-gh-action.js` plugin. Updated schema property (yes I know it is a breaking change but only me is using the GH action)
## others
* refactor: reenabled UT
* docs: added required repository config for squash commits as merging strategy. Listed GH actions features and use cases

# 0.12.2 fix: updated pre-commit-commands to only run if a release is required (#112)

## patches:
* fix: updated pre-commit-commands to only run if a release is required (#112)

# 0.12.1 fix: fixed error when getting previous non releasable commits with version file different from version.json (#111)

## patches:
* fix: fixed error when getting previous non releasable commits with version file different from version.json (#111)

# 0.12.0 feat: #109 allow execute bash commands before release commit. Fixes #109 (#110)

## new features:
* feat: #109 allow execute bash commands before release commit. Fixes #109 (#110)

# 0.11.1 fix: Updated GH action description (#108)

## patches:
* fix: Updated GH action description
## others
* refactor: minor refactor in version build-next-release.js

# 0.11.0 feat: #106 allow custom file for storing version. Useful for NPM projects. Fixes #106 (#107)

## new features:
* feat: #106 allow custom file for storing version. Useful for NPM projects. Fixes #106 (#107)
## others
* ci: undo error committed in the ci.yml that avoid deleting temporary repos for e2e tests (#95)
* test: clean test and delete config.default.yml (#97)
* ci: [ci.yml] minor change (#98)
* refactor: format yml files (#103)
* refactor: #101 created build-next-release.js function
* refactor: #101 [get-config] created github-scripts script for storing js code executed in actions/github-scripts step
* refactor: #101 [get-previous-changes] migrated gh step step to script
* refactor: #101 [parse-changes] migrated gh step step to script
* refactor: #101 [semver][build-commit-and-tags] migrated gh step step to script

# 0.10.0 feat: #93 make the GH action return the whole changelog-record with title, entries and body. Fixes #93 (#94)

## new features:
* feat: #93 make the GH action return the whole changelog-record with title, entries and body. Fixes #93
## patches:
* fix: fixed issue with release body when the last commit includes &quot;---------&quot;

# 0.9.0 feat: #72 make the release include previous non releasable commits. Fixes #72 (#92)

## new features:
* feat: #72 make the release include previous non releasable commits. Fixes #72 (#92)
## others
* docs: updated readme (#91)

# 0.8.0 feat: #89 allow allow prefix for git tags. Fixes #89 (#90)

## new features:
* feat: #89 allow allow prefix for git tags. Fixes #89 (#90)

# 0.7.9 fix: added new flag for tag-repo-version. renamed other input variables (#87)

## patches:
* fix: added new flag for tag-repo-version. renamed other input variables (#87)

# 0.7.8 fix: added test with branch protection enabled (#86)

## patches:
* fix: added test with branch protection enabled (#86)

# 0.7.7 fix: refresh GH action - no changes (#82)

## patches:
* fix: refresh GH action - no changes (#82)

# 0.7.6 fix: refresh GH action - no changes (#81)

## patches:
* fix: refresh GH action - no changes (#81)

# 0.7.5 fix: refresh GH action - no changes (#79)

## patches:
* fix: refresh GH action - no changes (#79)

# 0.7.4 fix: refresh GH action - no changes

## patches:
* fix: refresh GH action - no changes

# 0.7.3 fix: refresh GH action - no changes (#78)

## patches:
* fix: refresh GH action - no changes (#78)

# 0.7.2 fix: updated cd workflow (#77)

## patches:
* fix: updated cd workflow (#77)

# 0.7.1 fix: fixed schema (#71)

## patches:
* fix: fixed schema (#71)

# 0.7.0 feat: #37 added configuration validation using schema. Fixes #37 (#57)

## new features:
* feat: #37 added configuration validation using schema. Fixes #37 (#57)

# 0.6.1 fix: #54 change input to YML. Fixes (#56)

## patches:
* fix: #54 change input to YML. Fixes (#56)

# 0.6.0 #33 added E2E tests with scopes (#55)

## new features:
* feat: #33 added input for printing check annotation with the release version
## others
* refactor: #33 added E2E tests with scopes

# 0.5.0 feat: trigger release creation after adding annotations feature (#53)

## new features:
* feat: trigger release creation after adding annotations feature (#53)

# 0.4.0 feat: #42 listed link to release commit in the same repo. closed. (#43)

## new features:
* feat: #42 listed link to release commit in the same repo. closed. (#43)

# 0.3.0 refactor: #32 refactor to allow iteration over scopes version (#40)

## new features:
* feat: #32 created git tags for scopes. Closes #32
## others
* refactor: #32 refactor to allow iteration over scopes version

# 0.2.0 feat: #35 added commit-id as output for the GH action (#39)

## new features:
* feat: #35 added commit-id as output for the GH action (#39)

# 0.1.11 fix: [NO CHANGES] testing GH action release (#29)

## patches:
* fix: [NO CHANGES] testing GH action release (#29)

# 0.1.10 fix: solved error in release title (#28)

## patches:
* fix: solved error in release title (#28)

# 0.1.9 fix: [NO CHANGES] testing GH action release (#27)

## patches:
* fix: [NO CHANGES] testing GH action release (#27)

# 0.1.8 fix: [on-pr-closed] fixed error getting current branch (#26)

## patches:
* fix: [on-pr-closed] fixed error getting current branch (#26)

# 0.1.7 fix: [on-pr-closed] fixed error getting current branch (#25)

## patches:
* fix: [on-pr-closed] fixed error getting current branch (#25)

# 0.1.6 fix: fixed error in the workflow (#24)

## patches:
* fix: fixed error in the workflow (#24)

# 0.1.5 fix: fixed summary to depend ont input.print-summary (#20)

## patches:
* fix: fixed summary to depend ont input.print-summary (#20)

# 0.1.4 fix: fixed error when there is no tag in the latest commit at CrazyActionsTests repo (#18)

## patches:
* fix: [NO-CHANGES][action.yml] force new release for testing
## others
* ci: [ci.yml] fixed error when there is no tag in the latest commit at CrazyActionsTests repo

# 0.1.3 fix: [action.yml] fixed error printing the summary when there is no release (#17)

## patches:
* fix: [action.yml] fixed error printing the summary when there is no release (#17)

# 0.1.2 ci: updated e2e tests and include a clean workflow to undo changes in CrazyActionsTests repo (#15)

## patches:
* fix: added ci to default commit types
## others
* ci: updated e2e tests and include a clean workflow to undo changes in CrazyActionsTests repo

# 0.1.1 ci: refactor workflows (#14)

## patches:
* fix: [NO CHANGES][action.yml] test workflow detect changes
## others
* ci: refactor workflows
* ci: added eslint
* refactor: fixed all eslint errors
* refactor: fixed all eslint errors
* ci: updated ci.yml to validate code style

# 0.1.0 add release link (#13)

## new features:
* feat: added release-url in outputs and in the summary
## patches:
* fix: renamed GH release created to be &#39;{version} {title}&#39;

# 0.0.6 fix: [NO-CHANGES] test that CI workflow execute JS tests when index modified (#11)

## patches:
* fix: [NO-CHANGES] test that CI workflow execute JS tests when index modified (#11)

# 0.0.5 ci: rename steps (#10)

## patches:
* fix: added a  log for rest.repos.createRelease response
## others
* ci: rename steps
* ---------

# 0.0.4 fix: fixed summary and added E2E tests. Those merge and check version releases in teh repo CrazyActionsTests (#9)

## patches:
* fix: fixed summary and added E2E tests. Those merge and check version releases in teh repo CrazyActionsTests (#9)

# 0.0.3 fix: fixed summary bug (#8)

## patches:
* fix: fixed summary bug (#8)

# 0.0.2 fix: fixed summary to avoid display empty content when no release was triggered (#7)

## patches:
* fix: fixed summary to avoid display empty content when no release was triggered (#7)

# 0.0.1 fix: Created initial version

## patches:
* fix: Created initial version

