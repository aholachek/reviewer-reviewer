import React, { Component } from "react"
import PropTypes from "prop-types"
import { Tooltip } from "react-tippy"
import "react-tippy/dist/tippy.css"
import { Flipper, Flipped } from "react-flip-toolkit"
import renderTooltip from "./tooltips"
import styles from "./styles.module.scss"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCommentAlt,
  faCheck,
  faTimes
} from "@fortawesome/free-solid-svg-icons"

const tableConfig = [
  {
    name: "🏆 score",
    value: "score",
    tooltip: "An aggregate of the values in the other columns"
  },
  {
    name: "PRs reviewed",
    value: "total",
    tooltip: "How many PRs did this person review?"
  },
  {
    name: "PRs approved",
    value: "approved",
    tooltip: "How many PRs did this person approve?"
  },
  {
    name: "Times Requested",
    value: "prRequestCounts",
    tooltip: "How many PRs did this person approve?"
  },
  {
    name: "Team members helped",
    value: "teamMembersHelped",
    tooltip: "How many teammates did this person help by offering a review?"
  },
  {
    name: "Helpful comments",
    value: "thumbsUpReplies",
    tooltip:
      "How many of this person's comments received 👍 replies from the PR author?"
  }
]

class ReviewersRankingList extends Component {
  static propTypes = {}

  state = {
    sort: {
      direction: "desc",
      value: "score"
    }
  }

  render() {
    const { pullRequests, userData, summaryData } = this.props

    const userRow = Object.keys(summaryData).map(k => {
      summaryData[k].user = k
      return summaryData[k]
    })
    return (
      <ul className={styles.grid}>
        {userRow.map(r => {
          const { name, url, avatarUrl, login } = this.props.userData[r.user]
          return (
            <li>
              <div className="card">
                <a href={url} className={styles.nameLink}>
                  <figure
                    className="avatar badge"
                    data-badge={r.score && r.score.ranking}
                  >
                    <img src={avatarUrl} alt="" className={styles.avatar} />
                  </figure>
                  {name || login}
                </a>
                <div>
                  <div>
                    <h4>PRs</h4>
                    <ul>
                      {!!r.activity.approved.summary && (
                        <li>
                          {r.activity.approved.summary}&nbsp;
                          <FontAwesomeIcon icon={faCheck} />
                        </li>
                      )}
                      {!!r.activity.commented.summary && (
                        <li>
                          {r.activity.commented.summary}&nbsp;
                          <FontAwesomeIcon icon={faCommentAlt} />
                        </li>
                      )}
                      {!!r.activity.requestedChanges.summary && (
                        <li>
                          {r.activity.requestedChanges.summary}&nbsp;
                          <FontAwesomeIcon icon={faTimes} />
                        </li>
                      )}
                    </ul>

                    <div>
                      {/* Team members helped:
                      {r.activity.teamMembersHelped.detail.map(login => {
                        const { avatarUrl } = userData[login]
                        return (
                          <li>
                            <figure className="avatar badge">
                              <img
                                src={avatarUrl}
                                alt=""
                                className={styles.avatar}
                              />
                            </figure>
                          </li>
                        )
                      })} */}
                    </div>


                  </div>
                    <dl>
                      <dt>Median time to first review</dt>
                      <dd>{r.timeliness.timeToFirstReview.summary}</dd>
                    </dl>
                  <div>
                    <h4>Expertise</h4>
                    <dl>
                      <dt># people who requested at least one review</dt>
                      <dd />
                      <dt>Helpful comments</dt>
                      <dd>
                        {r.expertise.helpfulComments.summary}
                        {JSON.stringify(r.expertise.helpfulComments.detail)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
}

export default ReviewersRankingList
