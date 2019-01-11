import React from 'react'

import { flatten } from '../util/functions'
import { localforage } from '../util/storage'


export default class Launcher extends React.Component {
    state = {
        width: 630,
        height: 630,
        titlebar: 0,
        menubar: 0,
        toolbar: 0,
        scrollbars: 0,
        resizable: 0,
    }

    handleClick(event) {
        localforage.getItem('window').then(w => {
            open('app', '', flatten({
                ...this.state,
                ...w,
            }))
        })
    }

    render() {
        return <div class="launcher">
            <button type="button" onClick={ ::this.handleClick }>Launch</button>
        </div>
    }
}
