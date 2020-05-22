import React from 'react'

import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'
import { localforage, hydrate } from '../util/storage'

class State {
    @persist @observable collapsed = false
}

@observer
export class SettingsWindow extends React.Component {
    constructor(props) {
        super(props)
        const persistKey = `settings-window-${props.name}`
        this.settings = new State()
        hydrate(persistKey, this.settings)
    }

    toggle(event) {
        this.settings['collapsed'] = !this.settings['collapsed']
    }

    render() {
        const { children } = this.props
        const collapsedClass = this.settings['collapsed'] ? 'collapsed' : ''
        return (
            <fieldset className={`settings-window ${collapsedClass}`}>
                <div className="header">
                    <div className="name">{this.props.name}</div>
                    <div className="toggle" onClick={::this.toggle} />
                </div>
                <div className="contents">{children}</div>
            </fieldset>
        )
    }
}
