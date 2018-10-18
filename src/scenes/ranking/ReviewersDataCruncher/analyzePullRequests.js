const flatten = arr => arr.reduce((acc, curr) => acc.concat(curr), [])

const deepFlatten = arr => {
  return flatten(
    arr.map(item => {
      if (Array.isArray(item)) return deepFlatten(item)
      return item
    })
  )
}

const analyzePullRequests = pullRequests => {
  const reviews = pullRequests.map(pr => {
    const augmentedNodes = pr.reviews.nodes
      .map(review => {
        if (review.author.login === pr.author.login) return null
        review.prCreatedAt = pr.createdAt
        review.prAuthor = pr.author.login
        review.prPermalink = pr.permalink
        return review
      })
      .filter(x => x)
    return augmentedNodes
  })

  // consolidate what could be multiple comments, approvals, rejections on one pr
  //  by the same person
  let consolidatedReviews = reviews.map(arrayOfReviews => {
    const reviewDict = {}
    arrayOfReviews.forEach(r => {
      reviewDict[r.author.login] = reviewDict[r.author.login]
        ? reviewDict[r.author.login].concat(r)
        : [r]
    })

    return Object.keys(reviewDict).map(login => {
      const commentary = reviewDict[login]
      if (commentary.length === 1) return commentary

      const states = {
        COMMENTED: [],
        APPROVED: [],
        CHANGES_REQUESTED: []
      }
      commentary.forEach(c => states[c.state].push(c))

      const toReturn = []

      // consolidate comments and approvals and add as one lump
      const commentOrApproval = flatten([
        states["COMMENTED"],
        states["APPROVED"]
      ]).reduce((acc, curr) => {
        acc.comments.nodes = acc.comments.nodes.concat(curr.comments.nodes)
        acc.state = curr.state === "APPROVED" ? "APPROVED" : acc.state
        return acc
      })

      toReturn.push(commentOrApproval)

      if (states["CHANGES_REQUESTED"].length) {
        // consolidate changes_requested and add as another lump
        const changesRequested = states["CHANGES_REQUESTED"].reduce(
          (acc, curr) => {
            acc.comments.nodes = acc.comments.nodes.concat(curr.comments.nodes)
            return acc
          }
        )
        toReturn.push(changesRequested)
      }

      return flatten(toReturn)
    })
  })

  consolidatedReviews = deepFlatten(consolidatedReviews)

  const reviewerSummaryData = consolidatedReviews.reduce((acc, review) => {
    const author = review.author.login
    if (acc[author]) acc[author].push(review)
    else acc[author] = [review]
    return acc
  }, {})

  Object.keys(reviewerSummaryData).forEach(login => {
    const reviews = reviewerSummaryData[login]

    // need to dedupe for some reason
    let thumbsUpFromPRCreator = {}

    consolidatedReviews
      .filter(review => review.author.login === login)
      .forEach(review => {
        // comments made by this user
        review.comments.nodes.forEach(comment => {
          // reactions on each comment
          comment.reactions.nodes.forEach(reaction => {
            if (
              reaction.content === "THUMBS_UP" &&
              reaction.user.login === review.prAuthor
            ) {
              comment.prAuthor = review.prAuthor
              thumbsUpFromPRCreator[comment.id] = comment
            }
          })
        })
      })

    thumbsUpFromPRCreator = Object.values(thumbsUpFromPRCreator)

    // might have multiple entries for a changes_requested and ensuing approval, so unique
    const totalReviews = [...new Set(reviews.map(review => review.prPermalink))]

    const teamMembersHelped = [...new Set(reviews.map(r => r.prAuthor))]

    const approvedPrs = reviews
      .filter(r => r.state === "APPROVED")
      .map(r => r.prPermalink)

    const summary = {
      total: {
        summary: totalReviews.length,
        detail: totalReviews
      },
      teamMembersHelped: {
        summary: teamMembersHelped.length || null,
        detail: teamMembersHelped
      },
      approved: {
        summary: approvedPrs.length,
        detail: approvedPrs
      },
      thumbsUpReplies: {
        summary: thumbsUpFromPRCreator.length || null,
        presentationSummary: thumbsUpFromPRCreator.length
          ? `${thumbsUpFromPRCreator.length} 👍`
          : null,
        detail: thumbsUpFromPRCreator
      }
    }

    reviewerSummaryData[login] = summary
  })

  //finally calculate scores
  const scoreVals = Object.values(reviewerSummaryData)
  const maxTotal = Math.max(...scoreVals.map(v => v.total.summary))
  const maxApproved = Math.max(...scoreVals.map(v => v.approved.summary))
  const maxThumbsUp = Math.max(...scoreVals.map(v => v.thumbsUpReplies.summary))
  const maxTeamMembersHelped = Math.max(
    ...scoreVals.map(v => v.teamMembersHelped.summary)
  )
  Object.keys(reviewerSummaryData).forEach(login => {
    const allScores = reviewerSummaryData[login]
    const adjustedScoreArray = [
      allScores.total.summary / maxTotal,
      allScores.approved.summary / maxApproved,
      allScores.thumbsUpReplies.summary / maxThumbsUp,
      allScores.teamMembersHelped.summary / maxTeamMembersHelped
    ]
    allScores["score"] = {
      summary: Math.floor(
        (adjustedScoreArray.reduce((acc, curr) => acc + curr, 0) /
          adjustedScoreArray.length) *
          100
      )
    }
  })

  Object.keys(reviewerSummaryData)
    .sort((a, b) => {
      return (
        reviewerSummaryData[b].score.summary -
        reviewerSummaryData[a].score.summary
      )
    })
    .forEach((login, index) => {
      reviewerSummaryData[login].score.ranking = index + 1
    })

  return reviewerSummaryData
}

export default analyzePullRequests
