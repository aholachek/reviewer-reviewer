import gql from "graphql-tag"

export const queryOrganizationsForViewer = gql`
query queryOrganizationsForViewer {
  viewer {
    organizations(first:50) {
     	nodes {
        avatarUrl,
        name,
        login
      }
    }
  }
}
`
