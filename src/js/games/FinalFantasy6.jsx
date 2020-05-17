import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'
import classnames from 'classnames'

import { localforage, hydrate } from '../util/storage'
import { SettingsWindow } from '../components/SettingsWindow'


class State {
    @persist('list') @observable items = [
        'terra',
        'locke',
        'celes',
        'edgar',
        'sabin',
        'cyan',
        'shadow',
        'gau',
        'setzer',
        'strago',
        'relm',
        'mog',
        'gogo',
        'umaro',
    ]

    constructor() {
        this.items = this.items.map(item => ({
            name: item,
            completed: false,
        }))
    }
}
const state = new State()
hydrate('final-fantasy-6', state)


const ItemView = observer(({ item }) =>
    <div className={ classnames({
        item: true,
        active: item.completed,
    }) }>
        <img
            src={ `/img/ff6-characters/${item.name}.gif` }
            onClick={ () => item.completed = !item.completed }
        />
    </div>
)

@observer
class ItemList extends React.Component {
    render() {
        const items = this.props.items.map((item, index) => {
            return <ItemView item={ item } key={ index } />
        })
        return <div className="items">{ items }</div>
    }
}


@observer
export class FinalFantasy6 extends React.Component {
    render() {
        return <div className="final-fantasy-6">
            <ItemList items={ state.items } />
        </div>
    }
}


@observer
export class FinalFantasy6Settings extends React.Component {
    reset() {
        state.items.map(i => i.completed = false)
    }

    render() {
        return <SettingsWindow name="final fantasy 6 progress">
            <div className="inputs">
            </div>
            <div className="commands">
                <button onClick={ this.reset }>reset</button>
            </div>
        </SettingsWindow>
    }
}
