import React from 'react'
import { SettingsWindow } from '../util/SettingsWindow'
import { BackgroundImage, BackgroundImageSettings } from './BackgroundImage'
import { ParticleField, ParticleFieldSettings } from './ParticleField'
import { Visualizer, VisualizerSettings } from './Visualizer'
import { Gradient, GradientSettings } from './Gradient'


export function Background(props) {
  return (
    <>
      <BackgroundImage />
      <Gradient />
      <ParticleField />
      <Visualizer />
    </>
  )
}

export function BackgroundSettings(props) {
  return (
    <SettingsWindow name="background">
      <BackgroundImageSettings />
      <GradientSettings />
      <ParticleFieldSettings />
      <VisualizerSettings />
    </SettingsWindow>
  )
}
