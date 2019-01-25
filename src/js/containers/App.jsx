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


class State {
    // double tap
    @observable abortLock = false
    @persist('object') @observable bg1 = {
        color: "#0960c2",
        alpha: 30,
    }
    @persist('object') @observable bg2 = {
        color: "#da7c3e",
        alpha: 40,
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
        state.bg1 = bg1
    }

    changeBg2(bg2) {
        state.bg2 = bg2
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

    render() {
        let buttons = [
            <button key="1" onClick={ this.reset }>{ state.abortLock ? 'confirm' : 'hard reset' }</button>
        ]

        if (state.abortLock) {
            buttons.push(<button key="2" onClick={ this.abortReset }>cancel</button>)
        }

        return <fieldset className="general">
            <legend>general</legend>
            <div className="inputs">
                <div className="input">
                    <label>hold shift to change and scroll stars</label>
                </div>
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
                <div className="input">
                    <label>update speed</label>
                    <input
                        type="range"
                        className="reverse"
                        min="1"
                        max="100"
                        value={ state.updateSpeed }
                        onChange={ this.changeSpeed }
                    />
                </div>
            </div>
            <div className="commands">
                { buttons }
            </div>
        </fieldset>
    }
}


class Starfield {
    display = document.querySelector('.display')
    element = document.getElementById("c")
    stars = []

    constructor() {
        // get dimensions of window and resize the canvas to fit
        this.width = this.display.offsetWidth
        this.height = this.display.offsetHeight

        this.element.width = this.width
        this.element.height = this.height

        this.canvas = this.element.getContext("2d")
        // canvas.globalAlpha=0.25;
        this.canvas.globalAlpha = 0.5

        this.defaultZ = 11

        let lock = false
        this.display.addEventListener('mousemove', function(e) {
            if (lock == true) {
                state.starfieldX = e.clientX
                state.starfieldY = e.clientY
            }
        }, false)

        document.addEventListener('keydown', function(e) {
            if (e.keyCode == 16) {
                lock = true
            }
        }, false)

        document.addEventListener('keyup', function(e) {
            if (e.keyCode == 16) {
                lock = false
            }
        }, false)

        function wheel (e) {
            if (lock == false) {
                return
            }
            const change = state.starfieldZ - e.deltaY / 800
            state.starfieldZ = Math.min(Math.max(0, change), 2)
        }
        document.addEventListener("wheel", wheel)

        this.addStars = ::this.addStars
        this.update = ::this.update
        this.reset = ::this.reset
        // console.log()
        this.addStars(state.starfieldZ * 1000)
        this.update()
    }

    // if you add the stars all at once they group in noticeable waves
    addStars(count) {
        for (let i=0, n; i<count; i++) {
            n = {}
            this.reset(n)
            this.stars.push(n)
        }
        if (this.stars.length < 1000) {
            setTimeout(this.addStars, 77, count)
        }
    }

    reset(star) {
        star.x = (Math.random() * this.width - (this.width * 0.5)) * this.defaultZ
        star.y = (Math.random() * this.height - (this.height * 0.5)) * this.defaultZ
        star.z = this.defaultZ
        star.px = 0
        star.py = 0
        star.originX = state.starfieldX
        star.originY = state.starfieldY
        // star.color = Math.random() * 360
        star.color = 360
    }

    update() {
        this.canvas.clearRect(0, 0, this.width, this.height)

        for (let i=0; i<this.stars.length; i++) {
            const star = this.stars[i],
                x = star.x / star.z,
                y = star.y / star.z

            if (star.px !== 0) {
                this.canvas.strokeStyle = `hsl(${star.color}, 100%, 100%)`;
                // this.canvas.strokeStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
                // this.canvas.strokeStyle = "rgba(255,255,255,1)";
                this.canvas.lineWidth = (1.0 / star.z + 1) * 2 // size
                this.canvas.beginPath()
                this.canvas.moveTo(x + star.originX, y + star.originY)
                this.canvas.lineTo(star.px + star.originX, star.py + star.originY)
                this.canvas.stroke()
            }

            star.px = x
            star.py = y
            star.z -= state.starfieldZ

            // when star is out of the view field
            if (star.z < state.starfieldZ || star.px > this.width || star.py > this.height) {
                this.reset(star)
            }
        }

        setTimeout(this.update, state.updateSpeed)
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
        const starfield = new Starfield()
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
            <div className="background static" />
            <canvas id="c" className="background" />
            <div className="background" style={{
                backgroundImage: `linear-gradient(${rgba1}, ${rgba2})`,
            }} />
            <div className="display">
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
