export default pullRequests => {
  const prRequestCounts = {}
  pullRequests.forEach(pr => {
    if (!pr.reviewRequests) return
    const requestedReviewers = (pr.reviewRequests.edges || []).map(
      edge => edge.node.requestedReviewer.login
    )
    requestedReviewers.forEach(login => {
      if (prRequestCounts[login]) prRequestCounts[login].push(pr.permalink)
      else prRequestCounts[login] = [pr.permalink]
    })
  })
  return prRequestCounts
}
