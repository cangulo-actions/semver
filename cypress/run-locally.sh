source .vscode/secrets.sh
echo $GH_TOKEN
test_key="feat-print-summary"
pr_number="105"
gh_org="cangulo-actions-test"
gh_repo="semver-PR-$pr_number-$test_key"
branch="issue104"
token=$GH_TOKEN

# delete the repo
repo_path="$gh_org/$gh_repo"
gh repo delete $repo_path --yes

export CYPRESS_TEST_KEY="$test_key"
export CYPRESS_GH_ORG="$gh_org"                     #: ${{ env.GH_ORG }}
export CYPRESS_GH_TOKEN="$token"                  #: ${{ secrets.CANGULO_BOT_MODIFY_GH_WORKFLOWS }}
export CYPRESS_GH_API_URL="https://api.github.com" #: https://api.github.com
export CYPRESS_WAIT_TIME_CD_WORKFLOW="25000"       #: 25000 # wait 25 seconds before checking the CD workflow
export CYPRESS_API_RETRY_INTERVAL_MS="10000"       #: 10000 # retry every 10 seconds
export CYPRESS_API_RETRY_TIMEOUT_MS="40000"        #: 40000 # timeout after 40 seconds of retry
export CYPRESS_SEMVER_BRANCH="$branch"             #: ${{ github.head_ref }}
export CYPRESS_SEMVER_PR_NUMBER="$pr_number"        #: ${{ github.event.number }}
export CYPRESS_GH_USER_NAME="cangulo-semver-e2e-test[bot]"
export CYPRESS_GH_USER_EMAIL="cangulo-semver-e2e-test[bot]@users.noreply.github.com"

npx cypress open