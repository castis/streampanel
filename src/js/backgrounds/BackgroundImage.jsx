import React from 'react'
import { observer } from 'mobx-react'
import { storage } from '../util/storage'
import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { InputGroup } from '../util/InputGroup'


const state = storage(
  'bgimage',
  new (class {
    @persist @observable enabled = true
    @persist @observable updateSpeed = 40
    @persist @observable scrollXSpeed = 0.2
    @persist @observable scrollYSpeed = 0.3
    @persist @observable imageURL = "/static/img/bg/5.png"
    @observable image = new Image()

    constructor() {
      this.setImageUrl = ::this.setImageUrl
      this.setImageUrl(this.imageURL)
    }

    @observable setImageUrl(imageURL) {
      this.image = new Image()
      this.image.onload = () => {
        // otherwise theres a blank pixel between background tiles
        this.image.width = this.image.width - 0.01
        this.image.height = this.image.height - 0.01
      }
      this.image.src = this.imageURL = imageURL
    }
  })()
)

@observer
export class BackgroundImage extends React.Component {
  x = 0
  y = 0

  componentDidMount() {
    this.updater = () => this.update()
    this.element = this.refs.canvas
    this.canvas = this.element.getContext('2d')

    this.width = this.element.clientWidth
    this.height = this.element.clientHeight

    this.element.width = this.width
    this.element.height = this.height

    this.update()
  }

  update() {
    this.canvas.clearRect(0, 0, this.width, this.height)

    if (!state.enabled || state.image.width === 0 || state.image.height === 0) {
      return setTimeout(this.updater, 1000)
    }

    for(let i = -1; i < Math.ceil(this.width / state.image.width) + 1; i++) {
      for(let j = -1; j < Math.ceil(this.height / state.image.height) + 1; j++) {
        this.canvas.drawImage(
          state.image,
          (i * state.image.width) + this.x,
          (j * state.image.height) + this.y
        )
      }
    }
    this.x -= state.scrollXSpeed
    this.y -= state.scrollYSpeed

    if (this.x <= -state.image.width || this.x >= state.image.width) {
      this.x = 0
    }
    if (this.y <= -state.image.height || this.y >= state.image.height) {
      this.y = 0
    }

    setTimeout(this.updater, state.updateSpeed)
  }

  render() {
    return <canvas ref="canvas" className="background image" />
  }
}

@observer
export class BackgroundImageSettings extends React.Component {
  changeImageURL(event) {
    state.setImageUrl(event.target.value)
  }

  changeScrollXSpeed(event) {
    state.scrollXSpeed = event.target.value
  }

  resetScrollXSpeed() {
    state.scrollXSpeed = 0
  }

  changeScrollYSpeed(event) {
    state.scrollYSpeed = event.target.value
  }

  resetScrollYSpeed() {
    state.scrollYSpeed = 0
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
          <label>image</label>
          <select value={state.imageURL} onChange={this.changeImageURL}>
            <option value="/static/img/bg/1.gif">1</option>
            <option value="/static/img/bg/2.jpg">2</option>
            <option value="/static/img/bg/3.jpg">3</option>
            <option value="/static/img/bg/4.png">4</option>
            <option value="/static/img/bg/5.png">5</option>
          </select>
        </div>
        <div className="input">
          <label>x speed</label>
          <input
            type="range"
            className="reverse"
            min="-10"
            step="0.1"
            max="10"
            value={state.scrollXSpeed}
            onChange={this.changeScrollXSpeed}
            onDoubleClick={this.resetScrollXSpeed}
          />
        </div>
        <div className="input">
          <label>y speed</label>
          <input
            type="range"
            className="reverse"
            min="-10"
            step="0.1"
            max="10"
            value={state.scrollYSpeed}
            onChange={this.changeScrollYSpeed}
            onDoubleClick={this.resetScrollYSpeed}
          />
        </div>
        <div className="input">
          <label>update speed</label>
          <input
            type="range"
            className="reverse"
            min="1"
            max="100"
            value={state.updateSpeed}
            onChange={this.changeUpdateSpeed}
          />
        </div>
      </InputGroup>
    )
  }
}