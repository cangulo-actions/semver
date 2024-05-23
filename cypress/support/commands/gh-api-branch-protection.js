Cypress.Commands.add('setBranchProtection', ({ owner, repo, branch }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const setBranchProtection = `${ghAPIUrl}/repos/${owner}/${repo}/branches/${branch}/protection`

  return cy.request({
    method: 'PUT',
    url: setBranchProtection,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    body: {
      required_status_checks: {
        strict: true,
        contexts: []
      },
      restrictions: null,
      required_pull_request_reviews: {
        dismiss_stale_reviews: false,
        require_code_owner_reviews: false,
        require_last_push_approval: true,
        required_approving_review_count: 1
      },
      required_signatures: false,
      enforce_admins: false,
      required_linear_history: false,
      allow_force_pushes: false,
      allow_deletions: false,
      block_creations: false,
      required_conversation_resolution: false,
      lock_branch: false,
      allow_fork_syncing: false
    }
  }).then((response) => {
    return response.body
  })
})
