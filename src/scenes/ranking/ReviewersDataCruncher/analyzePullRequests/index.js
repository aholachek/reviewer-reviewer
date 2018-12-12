import keyReviewsByAuthor from "./keyReviewsByAuthor"
import createPrRequestCountDict from "./createPrRequestCountDict"
import analyzeComments from "./analyzeComments"
import analyzeReviewTimeliness from "./analyzeReviewTimeliness"

const analyzePullRequests = pullRequests => {
  const reviewerSummaryData = keyReviewsByAuthor(pullRequests)
  const prRequestCounts = createPrRequestCountDict(pullRequests)

  // analyze data for each reviewer
  Object.keys(reviewerSummaryData).forEach(login => {
    const reviews = reviewerSummaryData[login]

    const teamMembersHelped = [...new Set(reviews.map(r => r.prAuthor))]

    const approvedPrs = reviews
      .filter(r => r.state === "APPROVED")
      .map(r => r.prPermalink)

    const commentedPrs = reviews
      .filter(r => r.state === "COMMENTED")
      .map(r => r.prPermalink)

    const requestedChangesPrs = reviews
      .filter(r => r.state === "CHANGES_REQUESTED")
      .map(r => r.prPermalink)

    const summary = {
      activity: {
        approved: {
          summary: approvedPrs.length,
          detail: approvedPrs
        },
        commented: {
          summary: commentedPrs.length,
          detail: commentedPrs
        },
        requestedChanges: {
          summary: requestedChangesPrs.length,
          detail: requestedChangesPrs
        },
        teamMembersHelped: {
          summary: teamMembersHelped.length || null,
          detail: teamMembersHelped
        }
      },
      timeliness: {
        timeToFirstReview: analyzeReviewTimeliness(reviews, pullRequests)
      },
      expertise: {
        requested: {
          summary: Object.keys(prRequestCounts).length,
          detail: prRequestCounts
        },
        helpfulComments: analyzeComments(reviews)
      }
    }

    reviewerSummaryData[login] = summary
  })

  // //finally calculate scores
  // const scoreVals = Object.values(reviewerSummaryData)
  // const maxTotal = Math.max(...scoreVals.map(v => v.total.summary).concat(1))
  // const maxApproved = Math.max(
  //   ...scoreVals.map(v => v.approved.summary).concat(1)
  // )
  // const maxThumbsUp = Math.max(
  //   ...scoreVals.map(v => v.thumbsUpReplies.summary).concat(1)
  // )
  // const maxTeamMembersHelped = Math.max(
  //   ...scoreVals.map(v => v.teamMembersHelped.summary)
  // )
  // Object.keys(reviewerSummaryData).forEach(login => {
  //   const allScores = reviewerSummaryData[login]
  //   const adjustedScoreArray = [
  //     allScores.total.summary / maxTotal,
  //     allScores.approved.summary / maxApproved,
  //     allScores.thumbsUpReplies.summary / maxThumbsUp,
  //     allScores.teamMembersHelped.summary / maxTeamMembersHelped
  //   ]
  //   allScores["score"] = {
  //     summary: Math.floor(
  //       (adjustedScoreArray.reduce((acc, curr) => acc + curr, 0) /
  //         adjustedScoreArray.length) *
  //         100
  //     )
  //   }
  // })

  // Object.keys(reviewerSummaryData)
  //   .sort((a, b) => {
  //     return (
  //       reviewerSummaryData[b].score.summary -
  //       reviewerSummaryData[a].score.summary
  //     )
  //   })
  //   .forEach((login, index) => {
  //     reviewerSummaryData[login].score.ranking = index + 1
  //   })

  return reviewerSummaryData
}

export default analyzePullRequests
