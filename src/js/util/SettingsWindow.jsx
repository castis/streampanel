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
    this.toggle = ::this.toggle
  }

  toggle(event) {
    this.settings['collapsed'] = !this.settings['collapsed']
  }

  render() {
    const collapsedClass = this.settings['collapsed'] ? 'collapsed' : ''
    const { enabled, onChange, children, name } = this.props
    const enabler = onChange
      ? <input type="checkbox" checked={enabled} onChange={onChange} />
      : ''
    return (
      <fieldset className={`settings-window ${collapsedClass}`}>
        <div className="header" onDoubleClick={this.toggle}>
          <div className="name">{name}</div>
          {enabler}
        </div>
        <div className="contents">{children}</div>
      </fieldset>
    )
  }
}
