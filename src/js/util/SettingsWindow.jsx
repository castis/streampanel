import React from 'react'

import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'
import { storage } from '../util/storage'

class State {
    @persist @observable collapsed = false
}

@observer
export class SettingsWindow extends React.Component {
    constructor(props) {
        super(props)
        this.settings = storage(`settings-window-${props.name}`, new State())
    }

    toggle(event) {
        this.settings['collapsed'] = !this.settings['collapsed']
    }

    render() {
        const collapsedClass = this.settings['collapsed'] ? 'collapsed' : ''
        return (
            <fieldset className={`settings-window ${collapsedClass}`}>
                <div className="header">
                    <div className="name">{this.props.name}</div>
                    <div className="toggle" onClick={::this.toggle} />
                </div>
                <div className="contents">{this.props.children}</div>
            </fieldset>
        )
    }
}
