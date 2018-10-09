import compareAsc from "date-fns/compare_asc"
import subDays from "date-fns/sub_days"
import { getReviewsForRepo, queryAuthorDetails } from "./queries"

export const fetchAllReviewsForLastNDays = days => async ({
  client,
  repo,
  organization
}) => {
  const currentDate = new Date()
  const nDaysAgo = subDays(currentDate, days)

  let pullRequests = []

  let cursor = null

  while (true) {
    console.log(`requesting next 10 prs for ${repo}`)
    const { data } = await client.query({
      query: getReviewsForRepo,
      variables: {
        repo,
        organization,
        cursor
      }
    })
    pullRequests = pullRequests.concat(
      data.repository.pullRequests.edges.filter(
        edge => compareAsc(new Date(edge.node.createdAt), nDaysAgo) > -1
      )
    )
    const finalPR =
      data.repository.pullRequests.edges[
        data.repository.pullRequests.edges.length - 1
      ]
    if (compareAsc(new Date(finalPR.node.createdAt), nDaysAgo) > -1) {
      cursor = finalPR.cursor
    } else {
      break
    }
  }
  return pullRequests
}

export const fetchUserDetails = async ({ userLogins, client }) => {
  const authorInfo = await Promise.all(
    userLogins.map(login =>
      client.query({
        query: queryAuthorDetails,
        variables: {
          login
        }
      })
    )
  )
  return authorInfo.map(result => result.data.user).reduce((acc, curr) => {
    acc[curr.login] = curr
    return acc
  }, {})
}
