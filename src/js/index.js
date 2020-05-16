import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

import App from './containers/App'
import Launcher from './containers/Launcher'


const mountPoint = document.querySelector('#mount')
if (mountPoint) {
    ReactDOM.render(
        <Router>
            <Switch>
                <Route path="/" exact component={Launcher} />
                <Route path="/app" component={App} />
            </Switch>
        </Router>,
        mountPoint
    )
}
