import React, { Component } from "react"
import PropTypes from "prop-types"
import { Query } from "react-apollo"
import { queryReposForOrganization } from "./queries"
import styles from "./styles.module.scss"

const dayOptions = [15, 30, 60, 90]

class DataSettings extends Component {
  static propTypes = {
    updateDays: PropTypes.func,
    updateRepos: PropTypes.func,
    days: PropTypes.number,
    repos: PropTypes.array,
    organization: PropTypes.string
  }

  state = {}

  render() {
    const { organization, updateRepos, updateDays, days, repos } = this.props
    return (
      <Query query={queryReposForOrganization} variables={{ organization }}>
        {({ loading, error, data }) => {
          if (loading) return "Loading..."
          if (error) return `Error! ${error.message}`

          return (
            <form>
              <fieldset className={styles.fieldset}>
                <legend>Repositories</legend>
                <div className={styles.labelGrid}>
                  {data.repositoryOwner.repositories.nodes.map(
                    ({ name, url }) => {
                      return (
                        <label className={styles.label}>
                          <input
                            className={styles.input}
                            checked={repos.includes(name)}
                            type="checkbox"
                            name="repositories"
                            value={name}
                            onChange={e => {
                              if (e.target.checked) {
                                updateRepos(repos.concat(name))
                              } else {
                                updateRepos(repos.filter(r => r !== name))
                              }
                            }}
                          />
                          <span className={styles.labelName}>{name}</span>
                        </label>
                      )
                    }
                  )}
                </div>
              </fieldset>
              <fieldset className={styles.fieldset}>
                <legend>Days</legend>
                {dayOptions.map(option => (
                  <label className={styles.label}>
                    <input
                      className={styles.input}
                      checked={days === option}
                      type="radio"
                      name="days"
                      value={option}
                      onChange={() => {
                        updateDays(option)
                      }}
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            </form>
          )
        }}
      </Query>
    )
  }
}

export default DataSettings
