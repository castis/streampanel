import React from 'react'

import { SettingsWindow } from '../util/SettingsWindow'
import { Starfield, StarfieldSettings } from './Starfield'
import { Visualizer, VisualizerSettings } from './Visualizer'
import { Gradient, GradientSettings } from './Gradient'

export function Background(props) {
  return (
    <>
      <div className="background static" />
      <Gradient />
      <Starfield />
      <Visualizer />
    </>
  )
}

export function BackgroundSettings(props) {
  return (
    <SettingsWindow name="background">
      <GradientSettings />
      <StarfieldSettings />
      <VisualizerSettings />
    </SettingsWindow>
  )
}
