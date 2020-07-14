import React from 'react'
import { observer } from 'mobx-react'
import { storage } from '../util/storage'
import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { InputGroup } from '../util/InputGroup'
import { SettingsWindow } from '../util/SettingsWindow'
import { Starfield, StarfieldSettings } from './Starfield'
import { Visualizer, VisualizerSettings } from './Visualizer'
import { Gradient, GradientSettings } from './Gradient'

const state = storage(
  'bgimage',
  new (class {
    @persist @observable enabled = false
    @persist @observable updateSpeed = 10
    @persist @observable scrollSpeed = 0.2
  })()
)

@observer
class BackgroundImage extends React.Component {
  image = new Image()

  componentDidMount() {
    this.element = this.refs.canvas
    this.canvas = this.element.getContext('2d')

    this.width = this.element.clientWidth
    this.height = this.element.clientHeight

    this.element.width = this.width
    this.element.height = this.height

    this.progress = 0

    this.image = new Image()
    this.image.onload = () => {
      this.image.width = this.image.width - 0.1
      this.update()
    }
    this.image.src = "/static/img/bg/5.png"
  }

  update() {
    this.canvas.clearRect(0, 0, this.width, this.height)
    for(let i = -1; i < Math.ceil(this.width / this.image.width) + 1; i++) {
      for(let j = -1; j < Math.ceil(this.height / this.image.height); j++) {
        this.canvas.drawImage(this.image, (i*this.image.width)+this.progress, j*this.image.height)
      }
    }
    this.progress -= state.scrollSpeed

    if (this.progress <= -this.image.width || this.progress >= this.image.width) {
      this.progress = 0
    }

    setTimeout(() => this.update(), state.updateSpeed)
  }

  render() {
    return <canvas ref="canvas" className="background image" />
  }
}

@observer
export class BackgroundImageSettings extends React.Component {
  changeScrollSpeed(event) {
    state.scrollSpeed = event.target.value
  }

  changeUpdateSpeed(event) {
    state.updateSpeed = parseInt(event.target.value)
  }

  toggleEnabled() {
    state.enabled = !state.enabled
  }

  render() {
    return (
      <InputGroup
        name="background image"
        enabled={state.enabled}
        onChange={this.toggleEnabled}
      >
        <div className="input">
          <label>scroll speed</label>
          <input
            type="range"
            className="reverse"
            min="-10"
            step="0.1"
            max="10"
            value={state.scrollSpeed}
            onChange={this.changeScrollSpeed}
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
            onChange={this.changeUpdateSpeed}
          />
        </div>
      </InputGroup>
    )
  }
}

export function Background(props) {
  return (
    <>
      <BackgroundImage />
      <Gradient />
      <Starfield />
      <Visualizer />
    </>
  )
}

export function BackgroundSettings(props) {
  return (
    <SettingsWindow name="background">
      <BackgroundImageSettings />
      <GradientSettings />
      <StarfieldSettings />
      <VisualizerSettings />
    </SettingsWindow>
  )
}
