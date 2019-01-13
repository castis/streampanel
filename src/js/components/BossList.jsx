import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { hydrate } from '../util/storage'


const initialItems = [
    'kraid',
    'phantoon',
    'draygon',
    'ridley',
].map((item, idx) => ({
    name: item,
    completed: false,
}))


class BossState {
    @persist('list') @observable items = initialItems
}
const state = new BossState()
hydrate('bosses', state)



@observer
class ItemView extends React.Component {
    render() {
        const item = this.props.item
        const classes = classnames(item.name, {
            boss: true,
            active: item.completed,
        })
        return <div
            className={ classes }
            onClick={ () => this.props.onClick(item.name) }
        ></div>
    }
}


@observer
export class BossList extends React.Component {
    constructor(props) {
        super(props)
        this.handleClick = ::this.handleClick
    }

    handleClick(boss) {
        state.items.forEach(i => {
            if (i.name === boss) {
                i.completed = !i.completed
            }
        })
    }

    render() {
        const items = state.items.map((item, index) => {
            return <ItemView
                item={ item }
                key={ index }
                onClick={ this.handleClick }
            />
        })
        return <div className="bosses">
            { items }
        </div>
    }
}


export class BossListSettings extends React.Component {
    constructor(props) {
        super(props)
        this.handleReset = ::this.handleReset
    }

    handleReset() {
        state.items.map(i => i.completed = false)
    }

    render() {
        return <fieldset className="icons">
            <legend>bosses</legend>
            <div className="inputs"></div>
            <div className="commands">
                <button onClick={ this.handleReset }>reset</button>
            </div>
        </fieldset>
    }
}
