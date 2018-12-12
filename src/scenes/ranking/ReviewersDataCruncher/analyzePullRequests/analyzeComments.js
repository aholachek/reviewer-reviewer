import Sentiment from "sentiment"
const sentiment = new Sentiment()

// analyze a particular person's reviews
export default reviews => {
  const commentsWithPositiveResponses = []
  reviews.forEach(review => {
    review.comments.nodes.forEach(comment => {
      const positiveResponse = []
      comment.reactions.nodes.forEach(reaction => {
        if (
          reaction.content === "THUMBS_UP" &&
          reaction.user.login === review.prAuthor
        ) {
          positiveResponse.push(reaction.content)
        }
      })
      if (comment.authorReply) {
        const authorReplySentiment = sentiment.analyze(comment.authorReply)
          .score
        console.log(
          "comment had an author reply",
          comment.authorReply,
          authorReplySentiment
        )
        if (authorReplySentiment >= 3) {
          positiveResponse.push(comment.authorReply)
        }
      }

      if (positiveResponse.length) {
        commentsWithPositiveResponses.push({
          comment,
          positiveResponse
        })
      }
    })
  })

  return {
    detail: commentsWithPositiveResponses,
    summary: commentsWithPositiveResponses.length
  }
}
