import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { InputGroup } from '../util/InputGroup'
import ColorPicker from '../util/ColorPicker'
import { storage } from '../util/storage'

const state = storage(
    'gradient',
    new (class {
        @persist @observable enabled = true
        @persist('object') @observable bg1 = {
            r: 110,
            g: 174,
            b: 180,
            a: 0.2,
        }
        @persist('object') @observable bg2 = {
            r: 43,
            g: 33,
            b: 4,
            a: 0.41,
        }
    })()
)

@observer
export class Gradient extends React.Component {
    render() {
        if (!state.enabled) {
            return ''
        }

        const { bg1, bg2 } = state

        return (
            <div
                className="background"
                style={{
                    backgroundImage: `linear-gradient(
                    rgba(${bg1.r}, ${bg1.g}, ${bg1.b}, ${bg1.a}),
                    rgba(${bg2.r}, ${bg2.g}, ${bg2.b}, ${bg2.a})
                )`,
                }}
            />
        )
    }
}

@observer
export class GradientSettings extends React.Component {
    changeBg1(bg1) {
        state.bg1 = bg1.rgb
    }

    changeBg2(bg2) {
        state.bg2 = bg2.rgb
    }

    toggleEnabled() {
        state.enabled = !state.enabled
    }

    render() {
        return (
            <InputGroup
                name="gradient"
                enabled={state.enabled}
                onChange={this.toggleEnabled}
            >
                <div className="input">
                    <label>top</label>
                    <ColorPicker
                        color={state.bg1}
                        onChange={::this.changeBg1}
                    />
                </div>
                <div className="input">
                    <label>bottom</label>
                    <ColorPicker
                        color={state.bg2}
                        onChange={::this.changeBg2}
                    />
                </div>
            </InputGroup>
        )
    }
}
