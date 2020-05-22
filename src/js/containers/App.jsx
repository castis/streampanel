import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { Stopwatch, StopwatchSettings } from '../components/Stopwatch'
import { Gamepad, GamepadSettings } from '../components/Gamepad'
import { SettingsWindow } from '../components/SettingsWindow'

import { Starfield, StarfieldSettings } from '../components/Starfield'
import { Visualizer, VisualizerSettings } from '../components/Visualizer'

import ColorPicker from '../util/ColorPicker'

import { localforage, hydrate } from '../util/storage'

import { SuperMetroid, SuperMetroidSettings } from '../games/SuperMetroid'
import { FinalFantasy6, FinalFantasy6Settings } from '../games/FinalFantasy6'

// import "typeface-roboto-mono";

class State {
    // double tap
    @observable abortLock = false
    @persist @observable standby = false
    @persist('object') @observable bg1 = {
        r: 180,
        g: 135,
        b: 110,
        a: .2,
    }
    @persist('object') @observable bg2 = {
        r: 20,
        g: 130,
        b: 190,
        a: .5,
    }
    @persist @observable game = 'super-metroid'
}
const state = new State()
hydrate('general', state)


@observer
class GeneralSettings extends React.Component {

    constructor(props) {
        super(props)
        this.reset = ::this.reset
        this.availableGames = {
            'super-metroid': 'Super Metroid',
            'final-fantasy-6': 'Final Fantasy 6',
        }
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

    changeStandby(event) {
        state.standby = event.target.checked
    }

    changeGame(event) {
        state.game = event.target.value
    }

    render() {
        let buttons = [
            <button key="1" onClick={ this.reset }>{ state.abortLock ? 'confirm' : 'hard reset' }</button>
        ]

        if (state.abortLock) {
            buttons.push(<button key="2" onClick={ this.abortReset }>cancel</button>)
        }

        const games = Object.keys(this.availableGames).map(k => {
            return <option key={ k } value={ k }>{ this.availableGames[k] }</option>
        })


        return <SettingsWindow name="general settings">
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
                    <label>game</label>
                    <select value={ state.game } onChange={ this.changeGame }>
                        { games }
                    </select>
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
        </SettingsWindow>

    }
}


@observer
class Game extends React.Component {
    constructor(props) {
        super(props)
        this.games = {
            'super-metroid': <SuperMetroid />,
            'final-fantasy-6': <FinalFantasy6 />,
        }
    }
    render() {
        const { game } = state
        return this.games[game]
    }
}


@observer
class GameSettings extends React.Component {
    constructor(props) {
        super(props)
        this.games = {
            'super-metroid': <SuperMetroidSettings />,
            'final-fantasy-6': <FinalFantasy6Settings />,
        }
    }
    render() {
        const { game } = state
        return this.games[game]
    }
}



@observer
export class TestComponentn extends React.Component {
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
        const collapsedClass = this.settings['collapsed']
            ? 'collapsed'
            : ''
        return <fieldset className={`settings-window ${collapsedClass}`}>
            <div className="header">
                <div className="name">
                    { this.props.name }
                </div>
                <div className="toggle" onClick={ ::this.toggle }></div>
            </div>
            <div className="contents">
                { children }
            </div>
        </fieldset>
    }
}



@observer
export default class App extends React.Component {
    resize() {
        const { body } = document

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
        const { bg1, bg2 } = state

        return <div className="app">
            <div className="main">
                <div className="background static" />
                <Starfield />
                <div className="background" style={{
                    backgroundImage: `linear-gradient(
                        rgba(${bg1.r}, ${bg1.g}, ${bg1.b}, ${bg1.a}),
                        rgba(${bg2.r}, ${bg2.g}, ${bg2.b}, ${bg2.a})
                    )`,
                }} />
                <Visualizer />
                <div className={ classnames({
                    display: true,
                    standby: state.standby,
                }) }>
                    <Game />
                    <Stopwatch />
                    <Gamepad />
                </div>
            </div>
            <div className="settings">
                <GeneralSettings />
                <StarfieldSettings />
                <VisualizerSettings />
                <GameSettings />
                <StopwatchSettings />
                <GamepadSettings />
            </div>
        </div>
    }
}
