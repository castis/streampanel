import React from 'react'

import { flatten } from '../util/functions'
import { localforage } from '../util/storage'

export default class Launcher extends React.Component {
  state = {
    width: 630,
    height: 655,
    titlebar: 0,
    menubar: 0,
    toolbar: 0,
    scrollbars: 1,
    resizable: 0,
  }

  click(event) {
    // App.resize stores its window dimensions in local storage
    // so we can remember the size of the window
    localforage.getItem('window').then(w => {
      open(
        'app',
        '',
        flatten({
          ...this.state,
          ...w,
        })
      )
    })
  }

  render() {
    return (
      <div className="launcher">
        <button type="button" onClick={::this.click}>
          Launch
        </button>
      </div>
    )
  }
}
