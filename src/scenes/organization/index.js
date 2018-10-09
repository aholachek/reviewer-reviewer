import React, { Component } from "react"
import PropTypes from "prop-types"
import { Link } from "@reach/router"
import { Query } from "react-apollo"
import { queryOrganizationsForViewer } from "./query"

class ChooseOrganization extends Component {
  render() {
    return (
      <Query query={queryOrganizationsForViewer}>
        {({ loading, error, data }) => {
          if (loading) return "Loading..."
          if (error) return `Error! ${error.message}`

          return (
            <div className="empty centered-empty">
              <h1 className="empty-title h3">
                Choose an organization to get started
              </h1>
              <ul className="list-unstyled">
                {data.viewer.organizations.nodes.map(n => {
                  return (
                    <li>
                      <Link to={n.login}>
                        <img src={n.avatarUrl} className="avatar" alt="" />
                        <b>{n.name}</b>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default ChooseOrganization
