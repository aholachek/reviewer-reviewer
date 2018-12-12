import { deepFlatten, flatten } from "./utility"

export default pullRequests => {
  const reviewsForaPR = pullRequests.map(pr => {
    const augmentedNodes = pr.reviews.nodes
      .map(review => {
        // ignore self reviews
        if (review.author.login === pr.author.login) return null
        // cache for easy reference later
        review.prCreatedAt = pr.createdAt
        review.prAuthor = pr.author.login
        review.prPermalink = pr.permalink
        return review
      })
      .filter(x => x)
    return augmentedNodes
  })

  // we're interested if the author of the review had any comments in response
  // to a pr review comment
  const authorCommentDict = {}
  pullRequests.forEach(pr => {
    pr.reviews.nodes.forEach(review => {
      if (review.author.login === pr.author.login) {
        review.comments.nodes.filter(c => c.replyTo).forEach(reply => {
          authorCommentDict[pr.permalink] =
            authorCommentDict[pr.permalink] || {}
          authorCommentDict[pr.permalink][reply.replyTo.id] = reply.bodyHTML
        })
      }
    })
  })

  // consolidate what could be multiple comments, approvals, rejections on one pr
  //  by the same person
  const consolidatedReviews = reviewsForaPR.map(arrayOfReviews => {
    const reviewDict = {}
    arrayOfReviews.forEach(r => {
      reviewDict[r.author.login] = reviewDict[r.author.login]
        ? reviewDict[r.author.login].concat(r)
        : [r]
    })

    // person could have submitted a bunch of reviews for one pr
    // so consolidate them
    return Object.keys(reviewDict).map(login => {
      const submittedReviews = reviewDict[login]
      if (submittedReviews.length === 1) return submittedReviews

      const states = {
        COMMENTED: [],
        APPROVED: [],
        CHANGES_REQUESTED: [],
        DISMISSED: []
      }

      submittedReviews.forEach(c => states[c.state].push(c))

      const userReviews = []

      // if user approved a pr and also commented one it, make that count as just an approval
      const commentOrApproval = flatten([
        states["COMMENTED"],
        states["APPROVED"]
      ]).reduce(
        (acc, curr) => {
          if (curr.comments) {
            acc.comments.nodes = acc.comments.nodes.concat(curr.comments.nodes)
          }
          acc.state = curr.state === "APPROVED" ? "APPROVED" : acc.state
          return acc
        },
        {
          comments: {
            nodes: []
          }
        }
      )

      userReviews.push(commentOrApproval)

      if (states["CHANGES_REQUESTED"].length) {
        // consolidate changes_requested and add as another lump
        const changesRequested = states["CHANGES_REQUESTED"].reduce(
          (acc, curr) => {
            acc.comments.nodes = acc.comments.nodes.concat(curr.comments.nodes)
            return acc
          },
          {
            comments: {
              nodes: []
            }
          }
        )
        userReviews.push(changesRequested)
      }

      return flatten(userReviews)
    })
  })

  const reviewerSummaryData = deepFlatten(consolidatedReviews)
    .map(review => {
      review.comments.nodes.forEach(comment => {
        console.log(
          authorCommentDict[review.prPermalink] &&
            authorCommentDict[review.prPermalink][comment.id]
        )
        comment.authorReply =
          authorCommentDict[review.prPermalink] &&
          authorCommentDict[review.prPermalink][comment.id]
      })
      return review
    })
    .reduce((acc, review) => {
      const author = review.author && review.author.login
      // not sure why this happens sometimes
      if (!author) return acc
      if (acc[author]) acc[author].push(review)
      else acc[author] = [review]
      return acc
    }, {})
  return reviewerSummaryData
}
