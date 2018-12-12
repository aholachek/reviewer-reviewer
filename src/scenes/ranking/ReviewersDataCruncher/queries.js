import gql from "graphql-tag"

export const getReviewsForRepo = gql`
  query getReviewsForRepo(
    $organization: String!
    $repo: String!
    $cursor: String
  ) {
    repository(owner: $organization, name: $repo) {
      pullRequests(
        first: 10
        states: MERGED
        orderBy: { field: CREATED_AT, direction: DESC }
        after: $cursor
      ) {
        edges {
          cursor
          node {
            title
            createdAt
            permalink
            author {
              login
            }
            commits(last: 25) {
              nodes {
                commit {
                  committedDate
                }
              }
            }
            reviewRequests(first: 10) {
              edges {
                node {
                  requestedReviewer {
                    ... on User {
                      login
                    }
                  }
                }
              }
            }
            reviews(first: 10) {
              nodes {
                state
                id
                createdAt
                author {
                  login
                }
                comments(first: 20) {
                  nodes {
                    id
                    author {
                      login
                    }
                    path
                    replyTo {
                      id
                    }
                    bodyHTML
                    reactions(first: 10) {
                      nodes {
                        content
                        user {
                          login
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
// TODO: could this be aggregated somehow into a single request?
export const queryAuthorDetails = gql`
  query queryAuthorDetails($login: String!) {
    user(login: $login) {
      name
      avatarUrl
      login
      url
    }
  }
`
