import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { hydrate } from '../util/storage'


const initialItems = [
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
].map((item, idx) => ({
    name: item,
    completed: false,
}))


class ItemState {
    @persist('list') @observable items = initialItems
}
const state = new ItemState()
hydrate('items', state)


const ItemView = observer(({ item }) =>
    <div className={ classnames({
        item: true,
        active: item.completed,
    }) }>
        <img
            src={ `/img/items/${item.name}.png` }
            onClick={ () => item.completed = !item.completed }
        />
    </div>
)

@observer
export class ItemList extends React.Component {
    render() {
        const items = state.items.map((item, index) => {
            return <ItemView item={ item } key={ index } />
        })
        return <div className="items">{ items }</div>
    }
}


export class ItemListSettings extends React.Component {
    constructor(props) {
        super(props)
        this.handleReset = ::this.handleReset
    }

    handleReset() {
        state.items.map(i => i.completed = false)
    }

    render() {
        return <fieldset className="icons">
            <legend>icons</legend>
            <div className="commands">
                <button onClick={ this.handleReset }>reset</button>
            </div>
        </fieldset>
    }
}
