import React from 'react'
// import classnames as cx from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { hydrate } from '../util/storage'
const { min, max } = Math


class ControllerState {
    @persist @observable style = 'american'
    @persist @observable updateSpeed = 50
    @observable gamepads = []
    @observable active = ''
    @observable shouldUpdate = false
    @observable buttons = []

    constructor() {
        this.update = ::this.update
    }

    update() {
        if (!this.shouldUpdate) {
            return
        }

        const gamepad = this.gamepads[this.active];
        if (gamepad) {
            this.buttons = gamepad.buttons
        }

        setTimeout(this.update, this.updateSpeed)
    }

    activate(index) {
        // if a controller is active
        if (this.active !== '') {
            // if the active one is the one we just called for
            if (this.active == index) {
                // dont do anything
                return
            } else {
                this.deactivate()
            }
        }

        if (this.gamepads[index]) {
            this.active = index
            this.shouldUpdate = true
            this.update()
        }
    }

    deactivate() {
        this.shouldUpdate = false
        this.active = ''
        this.buttons = []
    }
}
const state = new ControllerState()
hydrate('controller', state)


@observer
export class Controller extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const button = {
            l1: '',
            r1: '',
            up: '',
            down: '',
            left: '',
            right: '',
            mode: '',
            select: '',
            start: '',
            x: '',
            y: '',
            a: '',
            b: '',
        }

        // xbox one
        // const map = {
        //     0: 'up',
        //     1: 'down',
        //     2: 'left',
        //     3: 'right',

        //     4: 'start',
        //     5: 'select',

        //     8: 'ls',
        //     9: 'rs',

        //     11: 'b',
        //     12: 'a',
        //     13: 'y',
        //     14: 'x',
        // }

        // 8BitDo SN30 pro
        const map = {
            0: 'y',
            1: 'b',
            2: 'a',
            3: 'x',

            4: 'l1',
            5: 'r1',

            6: 'l2',
            7: 'r2',

            8: 'select',
            9: 'start',

            10: 'l3',
            11: 'r3',

            12: 'mode',
            // 13: button.?,
            14: 'up',
            15: 'down',
            16: 'left',
            17: 'right',
        }

        state.buttons.map((b, i) => {
            button[map[i]] = b.pressed ? 'active' : ''
        })

        return <div className={`controller ${state.style}`}>
            <div className="shoulder">
                <div className={`btn l1 ${button.l1}`}></div>
                <div className={`btn r1 ${button.r1}`}></div>
            </div>
            <div className="body">
                <div className="dpad">
                    <div className={`btn up ${button.up}`}></div>
                    <div className={`btn down ${button.down}`}></div>
                    <div className={`btn left ${button.left}`}></div>
                    <div className={`btn right ${button.right}`}></div>
                    <div className={`btn mode ${button.mode}`}></div>
                </div>
                <div className="meta">
                    <div className={`btn select ${button.select}`}></div>
                    <div className={`btn start ${button.start}`}></div>
                </div>
                <div className="action">
                    <div className={`btn x ${button.x}`}></div>
                    <div className={`btn y ${button.y}`}></div>
                    <div className={`btn a ${button.a}`}></div>
                    <div className={`btn b ${button.b}`}></div>
                </div>
            </div>
        </div>
    }
}


@observer
export class ControllerSettings extends React.Component {
    constructor(props) {
        super(props)
        this.addGamepad = ::this.addGamepad
        this.removeGamepad = ::this.removeGamepad
    }

    addGamepad(event) {
        const gamepad = event.gamepad
        state.gamepads[gamepad.index] = gamepad
        // if (gamepad.index === 0) {
        //     state.active = 0
        //     // selector.value = gamepad.index;
        //     // selector.dispatchEvent(new Event('change'));
        // }
    }

    removeGamepad(event) {
        const gamepad = event.gamepad
        if (state.active && state.active.id == gamepad.id) {
            state.active = null
        }
        state.gamepads = state.gamepads.filter(g => g.index != gamepad.index)
    }

    componentDidMount() {
        if ('GamepadEvent' in window) {
            window.addEventListener('gamepadconnected', this.addGamepad);
            window.addEventListener('gamepaddisconnected', this.removeGamepad);
        }
    }

    componentWillUnmount() {
        if ('GamepadEvent' in window) {
            window.removeEventListener('gamepadconnected', this.addGamepad);
            window.removeEventListener('gamepaddisconnected', this.removeGamepad);
        }
    }

    handleControllerChange(event) {
        const index = parseInt(event.target.value)
        state.activate(index)
    }

    handleUpdateSpeed(event) {
        const value = parseInt(event.target.value || 1)
        state.updateSpeed = max(1, min(value, 256))
    }

    handleStyleChange(event) {
        state.style = event.target.value
    }

    render() {
        const options = state.gamepads.map(c => {
            return <option key={ c.index } value={ c.index }>
                { c.id }
            </option>
        })
        options.unshift(<option key="" value="">none</option>)

        return <fieldset className="controller">
            <legend>controller</legend>
            <div className="inputs">
                <div className="input">
                    <label>gamepad</label>
                    <select
                        value={ state.active }
                        onChange={ ::this.handleControllerChange }
                    >
                        { options }
                    </select>
                </div>
                <div className="input">
                    <label>style</label>
                    <select
                        value={ state.style }
                        onChange={ ::this.handleStyleChange }
                    >
                        <option value="american">american</option>
                        <option value="famicom">famicom</option>
                        <option value="superfamicom">super famicom</option>
                    </select>
                </div>
                <div className="input">
                    <label>update speed</label>
                    <input
                        type="range"
                        className="reverse"
                        min="8"
                        max="256"
                        value={ state.updateSpeed }
                        onChange={ this.handleUpdateSpeed }
                    />
                </div>
            </div>
        </fieldset>
    }
}
