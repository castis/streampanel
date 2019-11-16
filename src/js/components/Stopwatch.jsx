import React from 'react'
import classnames from 'classnames'
import format from 'format-number-with-string'
import { observable, action, computed } from 'mobx'
import { persist } from 'mobx-persist'
import { observer } from 'mobx-react'

import ColorPicker from '../util/ColorPicker'
import { hydrate } from '../util/storage'
const { min, max } = Math


class Timer {
    @persist @observable milliseconds = 0
    @persist @observable savedMilliseconds = 0

    @action saveTime() {
        this.savedMilliseconds += this.milliseconds
        this.milliseconds = 0
    }

    @action reset() {
        this.milliseconds = this.savedMilliseconds = 0
    }

    @computed get display() {
        const total = this.milliseconds + this.savedMilliseconds
        const milliseconds = parseInt(total / 10, 10)
        const seconds = parseInt(milliseconds / 100, 10)
        const minutes = parseInt(seconds / 60, 10)
        const hours = parseInt(seconds / 3600, 10)

        return <div className="segments">
            <span>{ hours }</span>:
            <span>{ format(minutes % 60, '00') }</span>:
            <span>{ format(seconds % 60, '00') }</span>
            <small>.{ format(milliseconds % 100, '00') }</small>
        </div>
    }
}


class TimerState {
    @persist('object', Timer) @observable timer = new Timer()
    @persist @observable isRunning = false
    @persist @observable startTime = 0
    @persist @observable updateSpeed = 60
    @persist @observable useSpaceBar = true
    @persist('object') @observable background = {
        r: 0,
        g: 0,
        b: 0,
        a: .5,
    }
    @persist('object') @observable font = {
        r: 255,
        g: 255,
        b: 255,
        a: .93,
    }

    constructor() {
        this.update = ::this.update
        this.start = ::this.start
        this.stop = ::this.stop
        this.toggle = ::this.toggle
        this.reset = ::this.reset
    }

    @computed get display() {
        return this.timer.display
    }

    @action update() {
        if (!this.isRunning) {
            return
        }
        this.timer.milliseconds = (new Date()).getTime() - this.startTime
        setTimeout(this.update, this.updateSpeed)
    }

    @action start(event) {
        if (this.isRunning) {
            return
        }
        this.isRunning = true
        this.startTime = (new Date()).getTime()
        this.update()
    }

    @action stop(event) {
        this.timer.saveTime()
        this.isRunning = false
    }

    @action toggle() {
        if (this.isRunning) {
            this.stop()
        } else {
            this.start()
        }
    }

    @action reset() {
        this.timer.reset()
        this.isRunning = false
    }
}

const state = new TimerState()
hydrate('timer', state).then(() => {
    state.update()
})


@observer
export class Stopwatch extends React.Component {
    render() {
        const bg = state.background
        const fg = state.font

        const style = {
            backgroundColor: `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${bg.a})`,
            color: `#${fg.r.toString(16)}${fg.g.toString(16)}${fg.b.toString(16)}`,
        }
        return <div className="timer" style={style}>
            <div style={{
                opacity: fg.a
            }}>{ state.display }</div>
        </div>
    }
}


class SpaceBar {
    // if im holding space down, dont register repeat keystrokes
    lock = false

    constructor() {
        this.keyDown = ::this.keyDown
        this.keyUp = ::this.keyUp
    }

    keyUp(event) {
        if (event.keyCode === 32) {
            this.lock = false
        }
    }

    keyDown(event) {
        if (event.keyCode === 32 && this.lock === false) {
            this.lock = true
            state.toggle()
        }
    }

    bind() {
        window.addEventListener('keydown', this.keyDown)
        window.addEventListener('keyup', this.keyUp)
    }

    unbind() {
        window.removeEventListener('keydown', this.keyDown)
        window.removeEventListener('keyup', this.keyUp)
    }
}

const spaceBar = new SpaceBar()

@observer
export class StopwatchSettings extends React.Component {
    constructor(props) {
        super(props)
        this.changeBackground = ::this.changeBackground
        this.changeFontColor = ::this.changeFontColor
        this.changeSpeed = ::this.changeSpeed
        this.changeSpaceBarToggle = ::this.changeSpaceBarToggle
    }

    componentDidMount() {
        if (state.useSpaceBar) {
            spaceBar.bind()
        }
    }

    componentWillUnmount() {
        if (state.useSpaceBar) {
            spaceBar.unbind()
        }
    }

    changeBackground(background) {
        state.background = background.rgb
    }

    changeFontColor(font) {
        state.font = font.rgb
    }

    changeSpeed(event) {
        const value = parseInt(event.target.value || 1)
        state.updateSpeed = max(1, min(value, 256))
    }

    changeSpaceBarToggle(event) {
        state.useSpaceBar = event.target.checked
        if (state.useSpaceBar) {
            spaceBar.bind()
        } else {
            spaceBar.unbind()
        }
    }

    render() {
        const classes = classnames({
            success: state.isRunning,
        })
        return <fieldset className="timer">
            <legend>timer</legend>
            <div className="inputs">
                <div className="input">
                    <label>background</label>
                    <ColorPicker
                        color={ state.background }
                        onChange={ this.changeBackground }
                    />
                </div>
                <div className="input">
                    <label>font color</label>
                    <ColorPicker
                        color={ state.font }
                        onChange={ this.changeFontColor }
                    />
                </div>
                <div className="input">
                    <label>update speed</label>
                    <input
                        type="range"
                        className="reverse"
                        min="8"
                        max="256"
                        value={ state.updateSpeed }
                        onChange={ this.changeSpeed }
                    />
                </div>
                <div className="input">
                    <label>space bar toggle</label>
                    <input
                        type="checkbox"
                        checked={ state.useSpaceBar }
                        onChange={ this.changeSpaceBarToggle }
                    />
                </div>
            </div>
            <div className="commands">
                <button className={ classes } onClick={ state.isRunning ? state.stop : state.start }>{ state.isRunning ? 'stop' : 'start' }</button>
                <button onClick={ state.reset }>reset</button>
            </div>
        </fieldset>
    }
}
