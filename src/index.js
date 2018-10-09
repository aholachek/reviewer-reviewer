import React, { Component } from "react"
import ReactDOM from "react-dom"
import Auth from "./Auth"
import { Location } from "@reach/router"

class Root extends Component {
  render() {
    return (
      <Location>{({ location }) => <Auth location={location} />}</Location>
    )
  }
}

ReactDOM.render(<Root />, document.getElementById("root"))
