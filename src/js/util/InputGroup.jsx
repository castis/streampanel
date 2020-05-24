import React from 'react'

import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'
import { storage } from '../util/storage'

class State {
    @persist @observable collapsed = false
}

@observer
export class InputGroup extends React.Component {
    constructor(props) {
        super(props)
        this.settings = storage(`settings-window-${props.name}`, new State())
    }

    toggle(event) {
        this.settings['collapsed'] = !this.settings['collapsed']
    }

    render() {
        const collapsedClass = this.settings['collapsed'] ? 'collapsed' : ''
        const { enabled, onChange, children, name } = this.props
        return (
            <fieldset className={`inputs ${collapsedClass}`}>
                <div className="header">
                    <div className="name" onDoubleClick={::this.toggle}>
                        {name}
                    </div>
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={onChange}
                    />
                </div>
                {children}
            </fieldset>
        )
    }
}
