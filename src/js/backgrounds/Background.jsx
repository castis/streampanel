import React from 'react'

import { SettingsWindow } from '../util/SettingsWindow'
import { Starfield, StarfieldSettings } from './Starfield'
import { Visualizer, VisualizerSettings } from './Visualizer'
import { Gradient, GradientSettings } from './Gradient'

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

export class BackgroundSettings extends React.Component {
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
