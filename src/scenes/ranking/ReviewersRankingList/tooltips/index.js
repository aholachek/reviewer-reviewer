import React from "react"
import PropTypes from "prop-types"
import styles from "./styles.module.scss"

export default function renderTooltip({ type, data, userData, pullRequests }) {
  switch (type) {
    case "score":
      return <div>An aggregate of all the other columns</div>
    case "total":
      return (
        <ol className={styles.prList}>
          {data.detail.map(prLink => {
            const pr = pullRequests.find(pr => pr.permalink === prLink)
            return (
              <li>
                <a href={prLink}>{pr ? pr.title : prLink}</a>
              </li>
            )
          })}
        </ol>
      )
    case "approved":
      return (
        <ol className={styles.prList}>
          {data.detail.map(prLink => {
            const pr = pullRequests.find(pr => pr.permalink === prLink)
            return (
              <li>
                <a href={prLink}>{pr ? pr.title : prLink}</a>
              </li>
            )
          })}
        </ol>
      )
    case "teamMembersHelped":
      return (
        <ul className={styles.tooltipList}>
          {data.detail.map(username => {
            if (userData[username])
              return (
                <li>
                  <img
                    src={userData[username].avatarUrl}
                    alt=""
                    className={styles.avatar}
                  />
                  {userData[username].name || username}
                </li>
              )
            return (
              <li>
                <div className={styles.defaultAvatar} />
                {username}
              </li>
            )
          })}
        </ul>
      )
    case "thumbsUpReplies":
      return (
        <ul className={styles.tooltipList}>
          {data.detail.map(comment => {
            return (
              <li>
                <div>{comment.bodyText}</div>
                <div>
                  <img
                    src={
                      userData[comment.prAuthor] &&
                      userData[comment.prAuthor].avatarUrl
                    }
                    alt=""
                    className={styles.avatar}
                  />
                  <span>
                    {userData[comment.prAuthor] &&
                      userData[comment.prAuthor].name}
                  </span>
                  &nbsp;👍
                </div>
              </li>
            )
          })}
        </ul>
      )

    default:
      return <div />
  }
}
