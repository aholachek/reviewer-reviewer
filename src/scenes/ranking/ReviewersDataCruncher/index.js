import React, { Component } from "react"
import PropTypes from "prop-types"
import { fetchAllReviewsForLastNDays, fetchUserDetails } from "./requests"
import analyzePullRequests from "./analyzePullRequests"

fetchAllReviewsForLastNDays(20)

class ReviewersDataCruncher extends Component {
  static propTypes = {
    client: PropTypes.object,
    organization: PropTypes.string,
    repos: PropTypes.array,
    days: PropTypes.number
  }

  static defaultProps = {
    repo: []
  }

  state = {
    userData: {},
    summaryData: [],
    loading: false
  }

  fetchData = async () => {
    this.setState({ loading: true })
    let pullRequests = await Promise.all(
      this.props.repos.map(repo => {
        return fetchAllReviewsForLastNDays(this.props.days)({
          repo,
          client: this.props.client,
          organization: this.props.organization
        })
      })
    )

    pullRequests = pullRequests
      .reduce((acc, curr) => acc.concat(curr), [])
      .map(edge => edge.node)

    const summaryData = analyzePullRequests(pullRequests)

    const userData = await fetchUserDetails({
      userLogins: Object.keys(summaryData),
      client: this.props.client
    })
    this.setState({
      userData,
      summaryData,
      pullRequests,
      loading: false
    })
  }

  componentDidMount = async () => {
    this.fetchData()
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.days !== this.props.days ||
      JSON.stringify(prevProps.repos) !== JSON.stringify(this.props.repos)
    )
      this.fetchData()
  }

  render() {
    const { summaryData, userData, pullRequests } = this.state
    return (
      <div>
        <div style={{ height: "1.4rem" }}>
          {this.state.loading && (
            <div class="toast toast-primary">
              <small>Loading repository data..</small>
            </div>
          )}
        </div>
        {this.props.children({
          userData,
          summaryData,
          pullRequests
        })}
      </div>
    )
  }
}

export default ReviewersDataCruncher
