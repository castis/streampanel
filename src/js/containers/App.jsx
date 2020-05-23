import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { SuperMetroid, SuperMetroidSettings } from '../games/SuperMetroid'
import { FinalFantasy6, FinalFantasy6Settings } from '../games/FinalFantasy6'

import { Background, BackgroundSettings } from '../backgrounds/Background'
import { Stopwatch, StopwatchSettings } from '../components/Stopwatch'
import { Gamepad, GamepadSettings } from '../components/Gamepad'

import { SettingsWindow } from '../util/SettingsWindow'
import { localforage, storage } from '../util/storage'

// import "typeface-roboto-mono";

const state = storage('general', new class {
    // double tap
    @observable abortLock = false
    @persist @observable standby = false
    @persist @observable game = 'super-metroid'
}())

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
            <button key="1" onClick={this.reset}>
                {state.abortLock ? 'confirm' : 'hard reset'}
            </button>,
        ]

        if (state.abortLock) {
            buttons.push(
                <button key="2" onClick={this.abortReset}>
                    cancel
                </button>
            )
        }

        const games = Object.keys(this.availableGames).map(k => {
            return (
                <option key={k} value={k}>
                    {this.availableGames[k]}
                </option>
            )
        })

        return (
            <SettingsWindow name="general settings">
                <div className="inputs">
                    <div className="input">
                        <label>game</label>
                        <select value={state.game} onChange={this.changeGame}>
                            {games}
                        </select>
                    </div>
                    <div className="input">
                        <label>standby</label>
                        <input
                            type="checkbox"
                            checked={state.standby}
                            onChange={this.changeStandby}
                        />
                    </div>
                </div>
                <div className="commands">{buttons}</div>
            </SettingsWindow>
        )
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
export default class App extends React.Component {
    resize() {
        const { body } = document
        localforage.setItem('window', {
            width: body.clientWidth,
            height: body.clientHeight,
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
        return (
            <div className="app">
                <div className="main">
                    <Background />
                    <div
                        className={classnames({
                            display: true,
                            standby: state.standby,
                        })}
                    >
                        <Game />
                        <Stopwatch />
                        <Gamepad />
                    </div>
                </div>
                <div className="settings">
                    <GeneralSettings />
                    <BackgroundSettings />
                    <GameSettings />
                    <StopwatchSettings />
                    <GamepadSettings />
                </div>
            </div>
        )
    }
}
