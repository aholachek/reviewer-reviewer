import React, { Component } from "react"
import PropTypes from "prop-types"
import ReviewersDataCruncher from "./ReviewersDataCruncher"
import ReviewersRankingList from "./ReviewersRankingList"
import DataSettings from "./DataSettings"

import { ApolloConsumer } from "react-apollo"

class ReviewerRatingList extends Component {
  state = {
    days: 15,
    repos: []
  }
  updateDays = days => {
    this.setState({ days })
  }
  updateRepos = repos => {
    this.setState({ repos })
  }
  render() {
    const { organization } = this.props
    return (
      <ApolloConsumer>
        {client => (
          <ReviewersDataCruncher
            client={client}
            organization={organization}
            repos={this.state.repos}
            days={this.state.days}
          >
            {({ userData, summaryData, pullRequests }) => (
              <div>
                <DataSettings
                  days={this.state.days}
                  repos={this.state.repos}
                  updateDays={this.updateDays}
                  updateRepos={this.updateRepos}
                  organization={organization}
                />
                <ReviewersRankingList
                  userData={userData}
                  summaryData={summaryData}
                  pullRequests={pullRequests}
                />
              </div>
            )}
          </ReviewersDataCruncher>
        )}
      </ApolloConsumer>
    )
  }
}

export default ReviewerRatingList
