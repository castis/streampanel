import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'
import ColorPicker from 'rc-color-picker'

import { ItemList, ItemListSettings } from '../components/ItemList'
import { BossList, BossListSettings } from '../components/BossList'
import { Stopwatch, StopwatchSettings } from '../components/Stopwatch'
import { Gamepad, GamepadSettings } from '../components/Gamepad'
import { hexToRgb } from '../util/functions'

import { localforage, hydrate } from '../util/storage'


import { SuperMetroid, SuperMetroidSettings } from '../games/SuperMetroid'


class GeneralState {
    @persist('object') @observable bg1 = {
        color: "#9FBCC7",
        alpha: 100,
    }
    @persist('object') @observable bg2 = {
        color: "#EBD9CC",
        alpha: 100,
    }
}
const state = new GeneralState()
hydrate('general', state)


@observer
class GeneralSettings extends React.Component {

    changeBg1(bg1) {
        state.bg1 = bg1
    }

    changeBg2(bg2) {
        state.bg2 = bg2
    }

    reset() {
        localforage.clear()
        window.location.reload(false)
    }

    render() {
        return <fieldset className="general">
            <legend>general</legend>
            <div className="inputs">
                <div className="input">
                    <label>background color 1</label>
                    <ColorPicker
                        color={ state.bg1.color }
                        alpha={ state.bg1.alpha }
                        onChange={ ::this.changeBg1 }
                    />
                </div>
                <div className="input">
                    <label>background color 2</label>
                    <ColorPicker
                        color={ state.bg2.color }
                        alpha={ state.bg2.alpha }
                        onChange={ ::this.changeBg2 }
                    />
                </div>
            </div>
            <div className="commands">
                <button onClick={ ::this.reset }>reset state</button>
            </div>
        </fieldset>
    }
}


@observer
export default class App extends React.Component {
    resize() {
        const body = document.body
        localforage.setItem('window', {
            'width': body.clientWidth,
            'height': body.clientHeight,
        })
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize)
        this.resize()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    render() {
        const bg1 = hexToRgb(state.bg1.color)
        const a1 = state.bg1.alpha / 100
        const rgba1 = `rgba(${bg1.r}, ${bg1.g}, ${bg1.b}, ${a1})`

        const bg2 = hexToRgb(state.bg2.color)
        const a2 = state.bg2.alpha / 100
        const rgba2 = `rgba(${bg2.r}, ${bg2.g}, ${bg2.b}, ${a2})`

        return <div className="app">
            <div className="display" style={{
                backgroundImage: `linear-gradient(${rgba1}, ${rgba2})`,
            }}>
                <SuperMetroid />
                <Stopwatch />
                <Gamepad />
            </div>
            <div className="settings">
                <GeneralSettings />
                <SuperMetroidSettings />
                <StopwatchSettings />
                <GamepadSettings />
            </div>
        </div>
    }
}
