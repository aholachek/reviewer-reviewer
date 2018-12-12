import gql from "graphql-tag"

export const queryOrganizationsForViewer = gql`
  query queryOrganizationsForViewer {
    repository(owner: "Facebook", name: "React") {
      pullRequests(
        first: 5
        states: MERGED
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        edges {
          cursor
          node {
            title
            createdAt
            permalink
            author {
              url
            }
            reviews(first: 10) {
              nodes {
                state
                id
                createdAt
                author {
                  url
                }
                comments(first: 20) {
                  nodes {
                    author {
                      url
                    }
                    bodyText
                    reactions(first: 10) {
                      nodes {
                        content
                        user {
                          url
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
