import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { ItemList } from '../components/ItemList'
import { BossList } from '../components/BossList'

import { localforage, hydrate } from '../util/storage'


class State {
    @persist('list') @observable items = [
        // 'missile',
        // 'super',
        // 'pbomb',
        // 'grappling',
        // 'xray',

        'charge',
        'ice',
        'wave',
        'spazer',
        'plasma',

        'varia',
        'gravity',

        'morph',
        'bomb',
        'springball',
        'screw',

        'hijump',
        'space',
        'speed',
    ]

    @persist('list') @observable bosses = [
        'kraid',
        'phantoon',
        'draygon',
        'ridley',
    ]

    constructor() {
        this.items = this.items.map(item => ({
            name: item,
            completed: false,
        }))

        this.bosses = this.bosses.map(item => ({
            name: item,
            completed: false,
        }))
    }
}
const state = new State()
hydrate('supermetroid', state)


@observer
export class SuperMetroid extends React.Component {
    render() {
        return <div className="super-metroid">
            <ItemList items={ state.items } />
            <BossList bosses={ state.bosses } />
        </div>
    }
}


@observer
export class SuperMetroidSettings extends React.Component {
    reset() {
        state.items.map(i => i.completed = false)
        state.bosses.map(b => b.completed = false)
    }

    render() {
        return <fieldset className="icons">
            <legend>progress</legend>
            <div className="inputs">
            </div>
            <div className="commands">
                <button onClick={ this.reset }>reset</button>
            </div>
        </fieldset>
    }
}
