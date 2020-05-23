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
import { Gradient, GradientSettings } from '../components/Gradient'

class State {
    @persist @observable enabled = true
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
    render() {
        return (
            <>
                <div className="background static" />
                <Gradient />
                <Starfield />
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

    toggleEnabled() {
        state.enabled = !state.enabled
    }

    render() {
        return (
            <SettingsWindow name="background">
                <GradientSettings />
                <StarfieldSettings />
                <VisualizerSettings />
            </SettingsWindow>
        )
    }
}
