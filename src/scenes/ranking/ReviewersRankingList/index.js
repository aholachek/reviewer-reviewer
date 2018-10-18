import React, { Component } from "react"
import PropTypes from "prop-types"
import { Tooltip } from "react-tippy"
import "react-tippy/dist/tippy.css"
import { Flipper, Flipped } from "react-flip-toolkit"
import renderTooltip from "./tooltips"
import styles from "./styles.module.scss"

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
    name: "Team members helped",
    value: "teamMembersHelped",
    tooltip:
      "How many team mates did this person help by offering a review?"
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
    if (!summaryData || Object.keys(summaryData).length === 0)
      return (
        <div className="empty">
          <div className="empty-icon">
            <i className="icon icon-reload" />
          </div>
          <h2 className="empty-title h3">No data available</h2>
          <p className="empty-subtitle">
            ...yet...
          </p>
        </div>
      )
    const rows = Object.keys(summaryData)
      .map(k => {
        summaryData[k].user = k
        return summaryData[k]
      })
      .sort((a, b) => {
        if (this.state.sort.direction === "desc")
          return (
            b[this.state.sort.value].summary - a[this.state.sort.value].summary
          )
        else
          return (
            a[this.state.sort.value].summary - b[this.state.sort.value].summary
          )
      })
    return (
      <Flipper
        className={styles.container}
        flipKey={
          JSON.stringify(this.state.sort) +
          JSON.stringify(this.props.summaryData)
        }
      >
        <div class="chip" style={{ marginLeft: "1rem" }}>
          Hover over the table for more information
        </div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th className={styles.td}>
                <span className="sr-only">team member</span>
              </th>
              {tableConfig.map(({ name, value, tooltip }) => (
                <th className={styles.titleRow}>
                  <Tooltip interactive theme="light" title={tooltip}>
                    {name}
                  </Tooltip>
                  <div>
                    <button
                      className={`${styles.sortBtn} btn btn-sm ${
                        this.state.sort.value === value &&
                        this.state.sort.direction === "asc"
                          ? "btn-primary"
                          : ""
                      }`}
                      onClick={() =>
                        this.setState({
                          sort: {
                            value,
                            direction: "asc"
                          }
                        })
                      }
                    >
                      ▲
                    </button>
                    <button
                      className={`${styles.sortBtn} btn btn-sm ${
                        this.state.sort.value === value &&
                        this.state.sort.direction === "desc"
                          ? "btn-primary"
                          : ""
                      }`}
                      onClick={() =>
                        this.setState({
                          sort: {
                            value,
                            direction: "desc"
                          }
                        })
                      }
                    >
                      ▼
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const { name, url, avatarUrl, login } = this.props.userData[
                r.user
              ]
              return (
                <Flipped flipId={r.user} key={r.user}>
                  <tr className={styles.tr}>
                    <td className={styles.td}>
                      <a href={url} className={styles.nameLink}>
                        <figure
                          className="avatar badge"
                          data-badge={r.score && r.score.ranking}
                        >
                          <img
                            src={avatarUrl}
                            alt=""
                            className={styles.avatar}
                          />
                        </figure>
                        {name || login}
                      </a>
                    </td>
                    {tableConfig.map(({ value }) => {
                      return (
                        <td className={styles.td}>
                          <Tooltip
                            interactive
                            theme="light"
                            html={renderTooltip({
                              type: value,
                              data: r[value],
                              userData,
                              pullRequests
                            })}
                          >
                            {r[value].presentationSummary
                              ? r[value].presentationSummary
                              : r[value].summary}
                          </Tooltip>
                        </td>
                      )
                    })}
                  </tr>
                </Flipped>
              )
            })}
          </tbody>
        </table>
      </Flipper>
    )
  }
}

export default ReviewersRankingList
