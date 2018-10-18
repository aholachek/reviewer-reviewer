import React, { Component } from "react"
import PropTypes from "prop-types"
import ApolloClient from "apollo-boost"
import { ApolloProvider } from "react-apollo"
import { InMemoryCache } from "apollo-cache-inmemory"
import { persistCache } from "apollo-cache-persist"
import queryString from "query-string"
import App from "./App"

const AUTH_TOKEN_KEY = "github_auth_token"

const cache = new InMemoryCache()

persistCache({
  cache,
  storage: window.localStorage
})

const queryArgs = {
  scope: "read:org repo"
}

class Auth extends Component {
  state = {
    accessToken: undefined
  }

  componentDidMount() {
    const { access_token: accessToken } = queryString.parse(
      this.props.location.search
    )
    if (accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
      this.setState({ accessToken })
    } else {
      const accessToken = localStorage.getItem(AUTH_TOKEN_KEY)
      if (accessToken) this.setState({ accessToken })
    }
  }
  render() {
    if (this.state.accessToken) {
      const client = new ApolloClient({
        uri: "https://api.github.com/graphql",
        headers: { authorization: `Bearer ${this.state.accessToken}` || "" },
        cache
      })

      return (
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      )
    } else {
      return (
        <div className="empty centered-empty">
          <div className="empty-icon">
            <i className="icon icon-people" />
          </div>
          <p className="empty-title h1">Reviewer Reviewer</p>
          <p>
            Explore who the most prolific code
            reviewers in your Github organization are, and rank them based on
            their contributions.
          </p>
          <div className="empty-action">
            <a
              className="btn btn-primary"
              href={`https://${
                process.env.NODE_ENV === "development"
                  ? `micro-github-qqcumfylol.now.sh`
                  : "micro-github-reviewer-reviewer.now.sh"
              }/login?${queryString.stringify(queryArgs)}`}
            >
              Sign in with Github to get started
            </a>
          </div>
        </div>
      )
    }
  }
}

export default Auth
