import React from 'react'
import classnames from 'classnames'
import { observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { SettingsWindow } from '../util/SettingsWindow'
import ColorPicker from '../util/ColorPicker'
import { localforage, hydrate } from '../util/storage'

import { Starfield, StarfieldSettings } from '../components/Starfield'
import { Visualizer, VisualizerSettings } from '../components/Visualizer'

class State {
    @persist('object') @observable bg1 = {
        r: 180,
        g: 135,
        b: 110,
        a: 0.2,
    }
    @persist('object') @observable bg2 = {
        r: 20,
        g: 130,
        b: 190,
        a: 0.5,
    }
}
const state = new State()
hydrate('background', state)

@observer
export class Background extends React.Component {
    // constructor(props) {
    //     super(props)
    //     const persistKey = `settings-window-${props.name}`
    //     this.settings = new State()
    //     hydrate(persistKey, this.settings)
    // }

    // toggle(event) {
    //     this.settings['collapsed'] = !this.settings['collapsed']
    // }

    render() {
        const { bg1, bg2 } = state
        return (
            <>
                <div className="background static" />
                <Starfield />
                <div
                    className="background"
                    style={{
                        backgroundImage: `linear-gradient(
                    rgba(${bg1.r}, ${bg1.g}, ${bg1.b}, ${bg1.a}),
                    rgba(${bg2.r}, ${bg2.g}, ${bg2.b}, ${bg2.a})
                )`,
                    }}
                />
                <Visualizer />
            </>
        )
    }
}

@observer
export class BackgroundSettings extends React.Component {
    changeBg1(bg1) {
        state.bg1 = bg1.rgb
    }

    changeBg2(bg2) {
        state.bg2 = bg2.rgb
    }

    render() {
        return (
            <>
                <SettingsWindow name="background">
                    <div className="inputs">
                        <div className="input">
                            <label>background color 1</label>
                            <ColorPicker
                                color={state.bg1}
                                onChange={::this.changeBg1}
                            />
                        </div>
                        <div className="input">
                            <label>background color 2</label>
                            <ColorPicker
                                color={state.bg2}
                                onChange={::this.changeBg2}
                            />
                        </div>
                    </div>
                </SettingsWindow>
                <StarfieldSettings />
                <VisualizerSettings />
            </>
        )
    }
}
