import compareAsc from "date-fns/compare_asc"
import isBefore from "date-fns/is_before"
import differenceInHours from "date-fns/difference_in_hours"

export default (reviews, pullRequests) => {
  const hoursToFirstReview = reviews.map(review => {
    const pr = pullRequests.find(pr => pr.permalink === review.prPermalink)
    const commitDates = pr.commits.nodes
      .map(n => n.commit.committedDate)
      .sort(compareAsc)

    const lastCommitBeforeFirstReview = commitDates
      .reverse()
      .find(d => isBefore(d, review.createdAt))
    console.log(commitDates, review.createdAt, lastCommitBeforeFirstReview)

    return differenceInHours(review.createdAt, lastCommitBeforeFirstReview)
  })

  const medianTimeToFirstReview = hoursToFirstReview.sort((a, b) => a - b)[
    hoursToFirstReview.length / 2
  ]

  return {
    summary: medianTimeToFirstReview || "N/A",
    detail: hoursToFirstReview
  }
}
