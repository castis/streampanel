import React from 'react'
import classnames from 'classnames'
import format from 'format-number-with-string'
import { observable, action, computed } from 'mobx'
import { persist } from 'mobx-persist'
import { observer } from 'mobx-react'

import ColorPicker from '../util/ColorPicker'
import { storage } from '../util/storage'
import { SettingsWindow } from '../util/SettingsWindow'
import { pad, msToTime } from '../util/functions'

const { min, max } = Math

const noop = () => {}

class Timer {
  @persist @observable milliseconds = 0
  @persist @observable savedMilliseconds = 0

  @action saveTime() {
    this.savedMilliseconds += this.milliseconds
    this.milliseconds = 0
  }

  @action reset() {
    this.milliseconds = this.savedMilliseconds = state.resetTo
  }

  @computed get elapsed() {
    return this.milliseconds + this.savedMilliseconds
  }

  @computed get display() {
    const milliseconds = parseInt(this.elapsed / 10, 10)
    const seconds = parseInt(milliseconds / 100, 10)
    const minutes = parseInt(seconds / 60, 10)
    const hours = parseInt(seconds / 3600, 10)
    const isNegative = seconds < 0

    return (
      <div className="segments">
        <span>{isNegative ? '-' : ' '}</span>
        <span>{hours}</span>:<span>{format(minutes % 60, '00')}</span>:
        <span>{format(seconds % 60, '00')}</span>
        <small>.{format(milliseconds % 100, '00')}</small>
      </div>
    )
  }
}

class TimerState {
  @persist('object', Timer) @observable timer = new Timer()
  @persist @observable isRunning = false
  @persist @observable startTime = 0
  @persist @observable updateSpeed = 60
  @persist @observable useSpaceBar = true
  @persist @observable resetTo = 0
  @persist('object') @observable background = {
    r: 0,
    g: 0,
    b: 0,
    a: 0.5,
  }
  @persist('object') @observable font = {
    r: 255,
    g: 255,
    b: 255,
    a: 0.9,
  }

  constructor() {
    this.update = ::this.update
    this.start = ::this.start
    this.stop = ::this.stop
    this.toggle = ::this.toggle
    this.reset = ::this.reset
    this.newSplit = ::this.newSplit
  }

  @computed get display() {
    return this.timer.display
  }

  @action update() {
    if (!this.isRunning) {
      return
    }
    this.timer.milliseconds = new Date().getTime() - this.startTime
    if (this.activeSplit > -1 && this.splits.length > this.activeSplit) {
      this.splits[this.activeSplit].actual = this.timer.milliseconds
    }
    setTimeout(this.update, this.updateSpeed)
  }

  @action start(event) {
    if (this.isRunning) {
      return
    }
    if (this.timer.savedMilliseconds === 0) {
      this.activeSplit = 0
    }
    this.isRunning = true
    this.startTime = new Date().getTime()
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
    this.activeSplit = -1
    this.splits.map(split => (split.actual = undefined))
  }

  @persist('list') @observable splits = []

  @persist @observable activeSplit = -1
  @persist @observable editing = undefined

  @action newSplit() {
    if (!this.isRunning) {
      return
    }
    this.splits.push({
      name: 'new split',
      target: state.timer.elapsed,
      actual: state.timer.elapsed,
      editing: false,
      order: this.splits.length,
    })
  }

  @action advanceSplit() {
    this.activeSplit++
  }
}

const state = storage('timer', new TimerState(), () => state.update())

@observer
export class Splits extends React.Component {
  constructor(props) {
    super(props)
    this.keyDown = ::this.keyDown
  }
  handleDoubleClick(event) {
    const key = event.target.parentElement.dataset['key']
    const found = state.splits.find((_, i) => i == key)
    if (found) {
      state.splits.map(s => (s.editing = false))
      found.editing = true
      keyHandler.unbind()
    }
  }

  renameSplit(event) {
    const split = state.splits.find(s => s.editing)
    if (split) {
      split.name = event.target.innerText
      split.editing = false
      keyHandler.bind()
    }
  }

  keyDown(event) {
    if (event.keyCode === 13) {
      event.target.blur()
      event.preventDefault()
    }
  }

  handleDelete(event) {
    state.splits.remove(state.splits[event.target.dataset.index])
  }

  render() {
    const { splits } = state
    return (
      <div className="splits">
        {splits.map((s, i) => {
          let delta = ''
          let sign = ''
          if (s.actual && i <= state.activeSplit) {
            const diff = s.actual - s.target
            sign = diff > 0 ? '+' : '-'
            delta = msToTime(diff)
          }

          return (
            <div key={i} data-key={i} className="split">
              <div className="icon" />
              <div
                className="name"
                onDoubleClick={this.handleDoubleClick}
                onKeyDown={this.keyDown}
                onBlur={this.renameSplit}
                contentEditable={s.editing}
                suppressContentEditableWarning="true"
              >
                {s.name}
              </div>
              <div className="delta">
                {sign}
                {delta}
              </div>
              <div className="time">
                {msToTime(s.target ? s.target : s.actual)}
              </div>
              <div className="commands">
                <div
                  className="delete"
                  data-index={i}
                  onDoubleClick={this.handleDelete}
                >
                  X
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}

@observer
export class Stopwatch extends React.Component {
  render() {
    const bg = state.background
    const fg = state.font

    const style = {
      backgroundColor: `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${bg.a})`,
      color: `#${fg.r.toString(16)}${fg.g.toString(16)}${fg.b.toString(16)}`,
    }
    return (
      <div className="timer" style={style}>
        <div
          className="big-time"
          style={{
            opacity: fg.a,
          }}
        >
          {state.display}
        </div>
        <Splits />
      </div>
    )
  }
}

class KeyHandler {
  // if im holding space down, dont register repeat keystrokes
  spaceLock = false

  constructor() {
    this.keyDown = ::this.keyDown
    this.keyUp = ::this.keyUp
  }

  keyUp(event) {
    if (event.keyCode === 32) {
      this.spaceLock = false
    }
  }

  keyDown(event) {
    if (event.keyCode === 32 && this.spaceLock === false) {
      this.spaceLock = true
      event.preventDefault()

      if(event.ctrlKey) {
        return state.newSplit()
      }
      if(event.shiftKey) {
        return state.advanceSplit()
      }
      if (state.isRunning) {
        state.stop()
      } else {
        state.start()
      }
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

const keyHandler = new KeyHandler()

@observer
export class StopwatchSettings extends React.Component {
  componentDidMount() {
    if (state.useSpaceBar) {
      keyHandler.bind()
    }
  }

  componentWillUnmount() {
    if (state.useSpaceBar) {
      keyHandler.unbind()
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
      keyHandler.bind()
    } else {
      keyHandler.unbind()
    }
  }

  render() {
    return (
      <SettingsWindow name="timer">
        <div className="inputs">
          <div className="input">
            <label>background</label>
            <ColorPicker
              color={state.background}
              onChange={this.changeBackground}
            />
          </div>
          <div className="input">
            <label>font color</label>
            <ColorPicker color={state.font} onChange={this.changeFontColor} />
          </div>
          <div className="input">
            <label>update speed</label>
            <input
              type="range"
              className="reverse"
              min="8"
              max="256"
              value={state.updateSpeed}
              onChange={this.changeSpeed}
            />
          </div>
          <div className="input">
            <label>space bar toggle</label>
            <input
              type="checkbox"
              checked={state.useSpaceBar}
              onChange={this.changeSpaceBarToggle}
            />
          </div>
        </div>
        <div className="commands">
          <button
            className={classnames({
              success: state.isRunning,
            })}
            onClick={state.isRunning ? state.stop : state.start}
          >
            {state.isRunning ? 'stop' : 'start'}
          </button>
          <button onClick={state.reset}>reset</button>
        </div>
      </SettingsWindow>
    )
  }
}
