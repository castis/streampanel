import React from 'react'

import { flatten } from '../util/functions'
import Container from '../util/container'
import { localforage } from '../util/storage'


export default class Launcher extends Container {
    className = 'launcher'
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
        return <button type="button" onClick={ ::this.handleClick }>Launch</button>
    }
}
