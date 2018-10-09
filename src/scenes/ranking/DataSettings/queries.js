import gql from "graphql-tag"

export const queryReposForOrganization = gql`
  query queryReposForOrganization($organization: String!) {
    repositoryOwner(login: $organization) {
      repositories(first: 30, orderBy: { direction: DESC, field: UPDATED_AT }) {
        nodes {
          id
          name
          url
          shortDescriptionHTML
        }
      }
    }
  }
`
