Cypress.Commands.add('triggerWorkflow', ({ workflowId, workflowParams }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const dispatchWorkflowUrl = `${ghAPIUrl}/actions/workflows/${workflowId}/dispatches`
  const expectedCode = 204

  return cy
    .request(
      {
        method: 'POST',
        url: dispatchWorkflowUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        },
        body: workflowParams
      }
    )
    .then((response) => {
      expect(response.status)
        .to.equal(expectedCode, 'the response code received when triggering the workflow is not the expected one')
      return response.body
    })
})
