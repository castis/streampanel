import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { ItemList } from '../util/ItemList'
import { BossList } from '../util/BossList'
import { SettingsWindow } from '../util/SettingsWindow'

import { storage } from '../util/storage'

const state = storage(
  'super-metroid',
  new (class {
    @persist('list') @observable items = [
      'missile',
      'super',
      'pbomb',
      'grappling',
      'xray',

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
  })()
)

@observer
export class SuperMetroid extends React.Component {
  render() {
    return (
      <div className="super-metroid">
        <ItemList items={state.items} />
        <BossList bosses={state.bosses} />
      </div>
    )
  }
}

@observer
export class SuperMetroidSettings extends React.Component {
  reset() {
    state.items.map(i => (i.completed = false))
    state.bosses.map(b => (b.completed = false))
  }

  render() {
    return (
      <SettingsWindow name="super metroid">
        <div className="inputs">
          <div className="input">
            <label>reset progress</label>
            <button onClick={this.reset}>reset</button>
          </div>
        </div>
      </SettingsWindow>
    )
  }
}
