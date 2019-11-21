import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { ItemList, ItemListSettings } from '../components/ItemList'
import { BossList, BossListSettings } from '../components/BossList'
import { Stopwatch, StopwatchSettings } from '../components/Stopwatch'
import { Gamepad, GamepadSettings } from '../components/Gamepad'

import { Starfield, StarfieldSettings } from '../backgrounds/Starfield'
import { Visualizer, VisualizerSettings } from '../backgrounds/Visualizer'

import ColorPicker from '../util/ColorPicker'

import { localforage, hydrate } from '../util/storage'


import { SuperMetroid, SuperMetroidSettings } from '../games/SuperMetroid'


class State {
    // double tap
    @observable abortLock = false
    @persist @observable standby = false
    @persist('object') @observable bg1 = {
        r: 20,
        g: 20,
        b: 20,
        a: .2,
    }
    @persist('object') @observable bg2 = {
        r: 190,
        g: 120,
        b: 20,
        a: .5,
    }
    @persist @observable updateSpeed = 20
    @persist @observable starfieldZ = 0.05
    @persist @observable starfieldX = 200
    @persist @observable starfieldY = 320
}
const state = new State()
hydrate('general', state)


@observer
class GeneralSettings extends React.Component {

    constructor(props) {
        super(props)
        this.reset = ::this.reset
        this.abortReset = ::this.abortReset
    }

    changeBg1(bg1) {
        state.bg1 = bg1.rgb
    }

    changeBg2(bg2) {
        state.bg2 = bg2.rgb
    }

    reset() {
        if (state.abortLock) {
            this.abortReset()
            localforage.clear()
            window.location.reload(false)
        } else {
            state.abortLock = true
        }
    }

    abortReset() {
        state.abortLock = false
    }

    changeSpeed(event) {
        const value = parseInt(event.target.value || 1)
        state.updateSpeed = Math.max(1, Math.min(value, 100))
    }

    changeStandby(event) {
        state.standby = event.target.checked
    }

    render() {
        let buttons = [
            <button key="1" onClick={ this.reset }>{ state.abortLock ? 'confirm' : 'hard reset' }</button>
        ]

        if (state.abortLock) {
            buttons.push(<button key="2" onClick={ this.abortReset }>cancel</button>)
        }

        return <fieldset className="general">
            <div className="header">
                general
            </div>
            <div className="inputs">
                <div className="input">
                    <label>background color 1</label>
                    <ColorPicker
                        color={ state.bg1 }
                        onChange={ ::this.changeBg1 }
                    />
                </div>
                <div className="input">
                    <label>background color 2</label>
                    <ColorPicker
                        color={ state.bg2 }
                        onChange={ ::this.changeBg2 }
                    />
                </div>
                <div className="input">
                    <label>standby</label>
                    <input
                        type="checkbox"
                        checked={ state.standby }
                        onChange={ this.changeStandby }
                    />
                </div>
            </div>
            <div className="commands">
                { buttons }
            </div>
        </fieldset>
    }
}


@observer
export default class App extends React.Component {

    constructor(props) {
        super(props)
        this.resize = ::this.resize
    }

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
        // const v = new Visualizer()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    render() {
        const bg1 = state.bg1
        const rgba1 = `rgba(${bg1.r}, ${bg1.g}, ${bg1.b}, ${bg1.a})`

        const bg2 = state.bg2
        const rgba2 = `rgba(${bg2.r}, ${bg2.g}, ${bg2.b}, ${bg2.a})`

        const displayStyle = classnames({
            display: true,
            standby: state.standby,
        })

        return <div className="app">
            <div className="main">
                <div className="background static" />
                <Starfield />
                <div className="background" style={{
                    backgroundImage: `linear-gradient(${rgba1}, ${rgba2})`,
                }} />
                <Visualizer />
                <div className={ displayStyle }>
                    <SuperMetroid />
                    <Stopwatch />
                    <Gamepad />
                </div>
            </div>
            <div className="settings">
                <GeneralSettings />
                <StarfieldSettings />
                <VisualizerSettings />
                <SuperMetroidSettings />
                <StopwatchSettings />
                <GamepadSettings />
            </div>
        </div>
    }
}
