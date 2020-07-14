import React from 'react'
import { SettingsWindow } from '../util/SettingsWindow'
import { BackgroundImage, BackgroundImageSettings } from './BackgroundImage'
import { Starfield, StarfieldSettings } from './Starfield'
import { Visualizer, VisualizerSettings } from './Visualizer'
import { Gradient, GradientSettings } from './Gradient'


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
