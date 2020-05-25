import React from 'react'

import { SketchPicker } from 'react-color'

export default class ColorPicker extends React.Component {
  state = {
    visible: false,
  }

  handleClick = () => {
    this.setState({
      visible: !this.state.visible,
    })
  }

  handleClose = () => {
    this.setState({
      visible: false,
    })
  }

  render() {
    let thing = null
    if (this.state.visible) {
      thing = (
        <div className="popover">
          <div className="cover" onClick={this.handleClose} />
          <SketchPicker
            color={this.props.color}
            onChange={this.props.onChange}
          />
        </div>
      )
    }
    const c = this.props.color
    const style = {
      background: `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`,
    }
    return (
      <div className="color-picker">
        <div className="swatch" onClick={this.handleClick}>
          <div className="color" style={style} />
        </div>
        {thing}
      </div>
    )
  }
}
