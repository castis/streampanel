import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { hydrate } from '../util/storage'
import { SettingsWindow } from '../util/SettingsWindow'

class ControllerState {
    @persist @observable color = 'white'
    @persist @observable style = 'inherit'
    @persist @observable opacity = 0.4
    @persist @observable updateSpeed = 50
    @observable gamepads = []
    @observable activeIndex = -1
    @observable buttons = []

    buttonLock = undefined
    buttons = [
        'up',
        'down',
        'left',
        'right',
        'a',
        'b',
        'x',
        'y',
        'l1',
        'r1',
        'select',
        'start',
    ]
    // which buttons index are we configuring?
    @observable configurable = -1

    // className to apply to each rendered button
    @observable button = {
        up: '',
        down: '',
        left: '',
        right: '',
        a: '',
        b: '',
        x: '',
        y: '',
        l1: '',
        r1: '',
        select: '',
        start: '',
        mode: '',
    }

    @persist('object') @observable map = {}

    constructor() {
        this.update = ::this.update
        this.buttonUpdate = ::this.buttonUpdate
        this.configure = ::this.configure
    }

    update() {
        if (this.active) {
            this.active.buttons.map(this.buttonUpdate)
            setTimeout(this.update, this.updateSpeed)
        }
    }

    buttonUpdate(button, index) {
        if (this.configurable > -1) {
            return this.configure(button, index)
        }
        this.button[this.map[index]] = button.pressed ? 'active' : ''
    }

    stopConfiguration() {
        this.configurable = -1
        Object.keys(this.button).forEach(b => {
            this.button[b] = ''
        })
    }

    configure(button, index) {
        if (this.buttons.length > index) {
            if (this.configurable == index) {
                this.button[this.buttons[index]] = 'configure active'
            } else {
                this.button[this.buttons[index]] = ''
            }
        }

        // if a button was pressed
        // but not the previously configured index
        if (button.pressed && this.buttonLock != index) {
            // map the current configurable index
            this.map[index] = this.buttons[this.configurable]

            // if theres a next button
            if (this.buttons.length > this.configurable + 1) {
                this.buttonLock = index
                this.configurable++
                // otherwise shut it down
            } else {
                this.stopConfiguration()
            }
            // if the current button was previously configured
            // but isnt being pressed
        } else if (!button.pressed && this.buttonLock == index) {
            this.buttonLock = undefined
        }
    }

    start(index) {
        if (this.gamepads[index]) {
            this.activeIndex = index
            this.active = this.gamepads[index]
            this.update()
        }
    }

    stop() {
        this.activeIndex = -1
        this.active = undefined
        this.buttons = []
    }
}
const state = new ControllerState()
hydrate('controller', state)

@observer
export class Gamepad extends React.Component {
    render() {
        return (
            <div
                className={`gamepad ${state.color} ${state.style}`}
                style={{
                    opacity: `${state.opacity}`,
                }}
            >
                <div className="shoulder">
                    <div className={`btn l1 ${state.button.l1}`} />
                    <div className={`btn r1 ${state.button.r1}`} />
                </div>
                <div className="body">
                    <div className="dpad">
                        <div className={`btn up ${state.button.up}`} />
                        <div className={`btn down ${state.button.down}`} />
                        <div className={`btn left ${state.button.left}`} />
                        <div className={`btn right ${state.button.right}`} />
                        <div className={`btn mode ${state.button.mode}`} />
                    </div>
                    <div className="meta">
                        <div className={`btn select ${state.button.select}`} />
                        <div className={`btn start ${state.button.start}`} />
                    </div>
                    <div className="action">
                        <div className={`btn x ${state.button.x}`} />
                        <div className={`btn y ${state.button.y}`} />
                        <div className={`btn a ${state.button.a}`} />
                        <div className={`btn b ${state.button.b}`} />
                    </div>
                </div>
            </div>
        )
    }
}

@observer
export class GamepadSettings extends React.Component {
    configuring = false

    constructor(props) {
        super(props)
        this.addGamepad = ::this.addGamepad
        this.removeGamepad = ::this.removeGamepad
        this.configure = ::this.configure
    }

    componentDidMount() {
        if ('GamepadEvent' in window) {
            window.addEventListener('gamepadconnected', this.addGamepad)
            window.addEventListener('gamepaddisconnected', this.removeGamepad)
        }
    }

    componentWillUnmount() {
        if ('GamepadEvent' in window) {
            window.removeEventListener('gamepadconnected', this.addGamepad)
            window.removeEventListener(
                'gamepaddisconnected',
                this.removeGamepad
            )
        }
    }

    addGamepad(event) {
        const gamepad = event.gamepad
        state.gamepads[gamepad.index] = gamepad
        // if its the first one added
        if (gamepad.index === 0) {
            state.start(0)
        }
    }

    removeGamepad(event) {
        const gamepad = event.gamepad
        if (state.activeIndex == gamepad.index) {
            state.stop()
        }
        state.gamepads = state.gamepads.filter(g => g.index != gamepad.index)
    }

    updateGamepad(event) {
        state.stop()
        const index = parseInt(event.target.value)
        state.start(index)
    }

    updateSpeed(event) {
        state.updateSpeed = event.target.value
    }

    updateOpacity(event) {
        state.opacity = event.target.value
    }

    updateStyle(event) {
        state.style = event.target.value
    }

    updateColor(event) {
        state.color = event.target.value
    }

    configure() {
        if (state.configurable > -1) {
            state.stopConfiguration()
        } else if (state.active) {
            state.configurable = 0
        }
    }

    render() {
        const options = state.gamepads.map(c => {
            return (
                <option key={c.index} value={c.index}>
                    {c.id}
                </option>
            )
        })
        options.unshift(
            <option key="-1" value="-1">
                none
            </option>
        )

        return (
            <SettingsWindow name="controller">
                <div className="inputs">
                    <div className="input">
                        <label>input</label>
                        <select
                            value={state.activeIndex}
                            onChange={::this.updateGamepad}
                        >
                            {options}
                        </select>
                    </div>
                    <div className="input">
                        <label>outline</label>
                        <select
                            value={state.color}
                            onChange={::this.updateColor}
                        >
                            <option value="white">white</option>
                            <option value="black">black</option>
                        </select>
                    </div>
                    <div className="input">
                        <label>style</label>
                        <select
                            value={state.style}
                            onChange={::this.updateStyle}
                        >
                            <option value="inherit">inherit</option>
                            <option value="american">american</option>
                            <option value="famicom">famicom</option>
                            <option value="superfamicom">super famicom</option>
                        </select>
                    </div>
                    <div className="input">
                        <label>opacity</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={state.opacity}
                            onChange={this.updateOpacity}
                        />
                    </div>
                    <div className="input">
                        <label>update speed</label>
                        <input
                            type="range"
                            className="reverse"
                            min="4"
                            max="256"
                            step="1"
                            value={state.updateSpeed}
                            onChange={this.updateSpeed}
                        />
                    </div>
                </div>
                <div className="commands">
                    <button onClick={this.configure}>
                        {state.configurable > -1 ? 'cancel' : 'configure'}
                    </button>
                </div>
            </SettingsWindow>
        )
    }
}
