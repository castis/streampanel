import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import ColorPicker from '../util/ColorPicker'

import { localforage, hydrate } from '../util/storage'


class State {
    @persist @observable updateSpeed = 16
    @persist('object') @observable color = {
        r: 255,
        g: 255,
        b: 255,
        a: .37,
    }
    @persist @observable maxStars = 250
    @persist @observable warp = 1

    @persist @observable starfieldZ = 0.09
    @persist @observable starfieldX = 200
    @persist @observable starfieldY = 320
}
const state = new State()
hydrate('starfield', state)


export class Starfield extends React.Component {

    stars = []
    shiftLock = false
    defaultZ = 11

    constructor(props) {
        super(props)

        this.bind = ::this.bind
        this.addStars = ::this.addStars
        this.update = ::this.update
        this.reset = ::this.reset
        this.moveStars = ::this.moveStars
        this.handleWheel = ::this.handleWheel
        this.handleShiftLock = ::this.handleShiftLock
    }

    componentDidMount() {
        this.element = this.refs.canvas
        this.width = this.element.clientWidth
        this.height = this.element.clientHeight

        this.halfWidth = this.width / 2
        this.halfHeight = this.height / 2

        this.element.width = this.width
        this.element.height = this.height

        this.canvas = this.element.getContext('2d')
        this.canvas.globalAlpha = 1

        this.bind()
        this.addStars(state.starfieldZ * 1000)
        this.update()
    }

    bind() {
        this.shiftLock = false
        document.querySelector('.display').addEventListener('mousemove', this.moveStars)
        document.addEventListener('keydown', this.handleShiftLock)
        document.addEventListener('keyup', this.handleShiftLock)
        document.addEventListener("wheel", this.handleWheel)
    }

    unbind() {
        document.querySelector('.display').removeEventListener('mousemove', this.moveStars)
        document.removeEventListener('keydown', this.handleShiftLock)
        document.removeEventListener('keyup', this.handleShiftLock)
        document.removeEventListener("wheel", this.handleWheel)
    }

    moveStars(event) {
        if (this.shiftLock == false) {
            return
        }
        state.starfieldX = event.clientX
        state.starfieldY = event.clientY
    }

    handleShiftLock(event) {
        this.shiftLock = event.shiftKey
    }

    handleWheel(event) {
        if (this.shiftLock == false) {
            return
        }
        const change = state.starfieldZ - event.deltaY / 800
        state.starfieldZ = Math.min(Math.max(0, change), 0.8)
    }

    // if you add the stars all at once they start in noticeable waves
    addStars(count) {
        for (let i=0, n; i<count; i++) {
            n = {}
            this.reset(n)
            this.stars.push(n)
        }
        if (this.stars.length < state.maxStars) {
            setTimeout(this.addStars, 77, count)
        }
    }

    removeStars(count) {
        for (let i=0; i<count; i++) {
            this.stars.pop()
        }
    }

    reset(star) {
        const bg1 = state.color
        star.color = `rgba(${bg1.r}, ${bg1.g}, ${bg1.b}, ${bg1.a})`

        star.x = (Math.random() * this.width - (this.width * 0.5)) * this.defaultZ
        star.y = (Math.random() * this.height - (this.height * 0.5)) * this.defaultZ
        star.z = this.defaultZ
        star.px = 0
        star.py = 0
        star.originX = state.starfieldX
        star.originY = state.starfieldY
        // star.color = Math.random() * 360
        // star.color = 360
        // star.color = rgba1
    }

    update() {
        this.canvas.clearRect(0, 0, this.width, this.height)

        for (let i=0; i<this.stars.length; i++) {
            const star = this.stars[i],
                x = star.x / star.z,
                y = star.y / star.z

            if (star.px !== 0) {
                // this.canvas.strokeStyle = `hsl(${star.color}, 100%, 100%)`
                this.canvas.strokeStyle = star.color
                // this.canvas.strokeStyle = `hsl(${Math.random() * 360}, 100%, 50%)`
                // this.canvas.strokeStyle = "rgba(255,255,255,1)"
                this.canvas.lineWidth = (1.0 / star.z + 1) * 2 // size
                this.canvas.beginPath()
                this.canvas.moveTo(x + star.originX, y + star.originY)
                this.canvas.lineTo(star.px + star.originX, star.py + star.originY)
                this.canvas.stroke()
            }

            star.px = x
            star.py = y
            star.z -= state.starfieldZ

            // star is out of bounds
            if (star.z < state.starfieldZ
                // || star.px < 0
                || Math.abs(star.px) > this.halfWidth
                // || star.py < 0
                || Math.abs(star.py) > this.halfHeight
            ) {
                this.reset(star)
            }
        }

        const diff = this.stars.length - state.maxStars
        if (diff < 0) {
            this.addStars(-diff)
        } else if (diff > 0) {
            this.removeStars(diff)
        }
        // if (this.stars.length > state.maxStars) {
        //     delete this.stars[i]
        // } else if (this.stars.length < state.maxStars) {

        // } else {

        // }

        setTimeout(this.update, state.updateSpeed)
    }

    render() {
        return <canvas ref="canvas" className="background" />
    }
}


@observer
export class StarfieldSettings extends React.Component {

    constructor(props) {
        super(props)
        this.changeSpeed = ::this.changeSpeed
        this.changeMaxStars = ::this.changeMaxStars
        this.changeColor = ::this.changeColor
    }

    changeColor(color) {
        state.color = color.rgb
    }

    changeSpeed(event) {
        state.updateSpeed = parseInt(event.target.value)
    }

    changeMaxStars(event) {
        state.maxStars = parseInt(event.target.value)
    }

    changeWarp(event) {
        state.starfieldZ = event.target.value
    }

    render() {
        return <fieldset className="starfield">
            <legend>starfield</legend>
            <div className="inputs">
                <div className="input">
                    <label>hold shift to change starfield origin</label>
                </div>
                <div className="input">
                    <label>color</label>
                    <ColorPicker
                        color={ state.color }
                        onChange={ ::this.changeColor }
                    />
                </div>
                <div className="input">
                    <label>stars</label>
                    <input
                        type="range"
                        min="100"
                        max="3000"
                        step="1"
                        value={ state.maxStars }
                        onChange={ this.changeMaxStars }
                    />
                </div>
                <div className="input">
                    <label>warp</label>
                    <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.02"
                        value={ state.starfieldZ }
                        onChange={ this.changeWarp }
                    />
                </div>
                <div className="input">
                    <label>update speed</label>
                    <input
                        type="range"
                        className="reverse"
                        min="1"
                        max="40"
                        value={ state.updateSpeed }
                        onChange={ this.changeSpeed }
                    />
                </div>
            </div>
        </fieldset>
    }
}