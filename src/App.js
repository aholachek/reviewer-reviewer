import React, { Component } from "react"
import { Router } from "@reach/router"
import Ranking from "./scenes/ranking"
import ChooseOrganization from "./scenes/organization"
import "./styles/index.scss"

class App extends Component {
  render() {
    return (
      <Router>
        <ChooseOrganization path="/" />
        <Ranking path="/:organization" />
      </Router>
    )
  }
}

export default App
