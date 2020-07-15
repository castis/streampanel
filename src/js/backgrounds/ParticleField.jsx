import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import ColorPicker from '../util/ColorPicker'
import { InputGroup } from '../util/InputGroup'
import { storage } from '../util/storage'

const state = storage(
  'particlefield',
  new (class {
    @persist @observable enabled = false
    @persist @observable updateSpeed = 10
    @persist('object') @observable color = {
      r: 255,
      g: 255,
      b: 255,
      a: 0.8,
    }
    @persist @observable maxParticles = 450
    @persist @observable warp = 0.2

    @persist @observable starfieldZ = 0.09
    @persist @observable starfieldX = 200
    @persist @observable starfieldY = 320
  })()
)

@observer
export class ParticleField extends React.Component {
  particles = []
  defaultZ = 80

  constructor(props) {
    super(props)

    // this.bind = ::this.bind
    this.addParticles = ::this.addParticles
    this.update = ::this.update
    this.reset = ::this.reset
    this.moveStars = ::this.moveStars
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
    this.addParticles(state.starfieldZ * 1000)
    this.update()
  }

  bind() {
    this.shiftLock = false
    document
      .querySelector('.display')
      .addEventListener('mousemove', this.moveStars)
    document.addEventListener('keydown', this.handleShiftLock)
    document.addEventListener('keyup', this.handleShiftLock)
  }

  unbind() {
    document
      .querySelector('.display')
      .removeEventListener('mousemove', this.moveStars)
    document.removeEventListener('keydown', this.handleShiftLock)
    document.removeEventListener('keyup', this.handleShiftLock)
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

  // if you add the particles all at once they start in noticeable waves
  addParticles(count) {
    for (let i = 0, n; i < count; i++) {
      n = {}
      this.reset(n)
      this.particles.push(n)
    }
    if (this.particles.length < state.maxParticles) {
      setTimeout(this.addParticles, 77, count)
    }
  }

  removeStars(count) {
    for (let i = 0; i < count; i++) {
      this.particles.pop()
    }
  }

  reset(star) {
    const { r, g, b, a } = state.color
    star.color = `rgba(${r}, ${g}, ${b}, ${a})`
    star.x = (Math.random() * this.width - this.width * 0.5) * this.defaultZ
    star.y = (Math.random() * this.height - this.height * 0.5) * this.defaultZ
    star.z = this.defaultZ
    star.px = 0
    star.py = 0
    star.originX = state.starfieldX
    star.originY = state.starfieldY
  }

  update() {
    this.canvas.clearRect(0, 0, this.width, this.height)

    if (!state.enabled) {
      return setTimeout(this.update, 1000)
    }

    // adjust the number of particles
    const diff = this.particles.length - state.maxParticles
    if (diff < 0) {
      this.addParticles(-diff)
    } else if (diff > 0) {
      this.removeStars(diff)
    }

    // if we have no particles, do nothing
    if (this.particles.length == 0) {
      return setTimeout(this.update, 1000)
    }

    for (let i = 0; i < this.particles.length; i++) {
      const star = this.particles[i],
        x = star.x / star.z,
        y = star.y / star.z

      if (star.px !== 0) {
        this.canvas.strokeStyle = star.color
        this.canvas.lineWidth = (1.0 / star.z + 1) * 2
        this.canvas.beginPath()
        this.canvas.moveTo(x + star.originX, y + star.originY)
        this.canvas.lineTo(star.px + star.originX, star.py + star.originY)
        this.canvas.stroke()
      }

      star.px = x
      star.py = y
      star.z -= state.starfieldZ

      // star is out of bounds
      if (
        star.z < state.starfieldZ ||
        star.px > this.width ||
        star.py > this.height
      ) {
        this.reset(star)
      }
    }

    setTimeout(this.update, state.updateSpeed)
  }

  render() {
    return <canvas ref="canvas" className="background" />
  }
}

@observer
export class ParticleFieldSettings extends React.Component {
  constructor(props) {
    super(props)
  }

  changeColor(color) {
    state.color = color.rgb
  }

  changeSpeed(event) {
    state.updateSpeed = parseInt(event.target.value)
  }

  changeMaxParticles(event) {
    state.maxParticles = parseInt(event.target.value)
  }

  changeWarp(event) {
    state.starfieldZ = event.target.value
  }

  toggleEnabled() {
    state.enabled = !state.enabled
  }

  render() {
    return (
      <InputGroup
        name="particle field"
        enabled={state.enabled}
        onChange={this.toggleEnabled}
      >
        <div className="input">
          <label>color</label>
          <ColorPicker color={state.color} onChange={this.changeColor} />
        </div>
        <div className="input">
          <label>particles</label>
          <input
            type="range"
            min="0"
            max="3000"
            step="1"
            value={state.maxParticles}
            onChange={this.changeMaxParticles}
          />
        </div>
        <div className="input">
          <label>warp</label>
          <input
            type="range"
            min="0.001"
            max="1.5"
            step="0.005"
            value={state.starfieldZ}
            onChange={this.changeWarp}
          />
        </div>
        <div className="input">
          <label>update speed</label>
          <input
            type="range"
            className="reverse"
            min="1"
            max="40"
            value={state.updateSpeed}
            onChange={this.changeSpeed}
          />
        </div>
      </InputGroup>
    )
  }
}
