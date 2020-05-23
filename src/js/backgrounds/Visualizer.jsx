import React from 'react'
import classnames from 'classnames'
import { observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { SettingsWindow } from '../util/SettingsWindow'
import ColorPicker from '../util/ColorPicker'
import { storage } from '../util/storage'

const state = storage(
    'visualizer',
    new (class {
        @persist @observable enabled = true
        @persist @observable updateSpeed = 16
        @persist('object') @observable color = {
            r: 255,
            g: 255,
            b: 255,
            a: 0.37,
        }
        @observable started = false
        @observable permission = false
        @observable running = false

        paths = []
        visualizer = undefined
        mask = undefined
        audioContext = undefined
        analyzer = undefined
        bufferLength = 82
        frequencies = new Uint8Array(82)

        constructor() {
            this.start = ::this.start
            this.soundAllowed = ::this.soundAllowed
            this.update = ::this.update
            this.frequencyMap = ::this.frequencyMap
        }

        start(stream) {
            if (this.running) {
                return
            }

            const visualizer = document.getElementById('visualizer')
            visualizer.setAttribute('viewBox', '0 0 255 255')

            this.paths = document.getElementsByTagName('path')
            this.mask = visualizer.getElementById('mask')

            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(this.soundAllowed)
                .catch(err => console.log(err))

            this.audioContext = new AudioContext()
        }

        stop() {
            this.running = false
            this.frequencies = this.frequencies.map(f => 0)
            if (this.mask) {
                while (this.mask.hasChildNodes()) {
                    this.mask.removeChild(this.mask.lastChild)
                }
            }
            this.update()
        }

        soundAllowed(stream) {
            const audioContext = new AudioContext()
            const audioStream = audioContext.createMediaStreamSource(stream)

            this.analyser = audioContext.createAnalyser()
            this.analyser.fftSize = 1024

            audioStream.connect(this.analyser)

            for (let i = 0, path; i < this.bufferLength; i++) {
                path = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'path'
                )
                this.mask.appendChild(path)
            }

            this.itemWidth = 400 / this.bufferLength
            this.running = true
            this.update()
        }

        frequencyMap(f, i) {
            let len = Math.floor(f) - (Math.floor(f) % 5)
            if (this.paths[i]) {
                this.paths[i].setAttribute(
                    'd',
                    `M${i * this.itemWidth} 255l0 -${len}l${this.itemWidth} 0`
                )
            }
        }

        update() {
            this.analyser.getByteFrequencyData(this.frequencies)
            this.frequencies.map(this.frequencyMap)

            if (this.running) {
                setTimeout(this.update, this.updateSpeed)
            }
        }

        // var showVolume = function () {
        //     setTimeout(showVolume, 500);

        //     if (start) {
        //         analyser.getByteFrequencyData(frequencyArray);
        //         var total = 0
        //         for(var i = 0; i < 255; i++) {
        //            var x = frequencyArray[i];
        //            total += x * x;
        //         }
        //         var rms = Math.sqrt(total / bufferLength);
        //         var db = 20 * ( Math.log(rms) / Math.log(10) );
        //         db = Math.max(db, 0); // sanity check
        //         h.innerHTML = Math.floor(db) + " dB";

        //         if (db >= volumeThreshold) {
        //             seconds += 0.5;
        //             if (seconds >= 5) {
        //                 hSub.innerHTML = "You’ve been in loud environment for<span> " + Math.floor(seconds) + " </span>seconds." ;
        //             }
        //         }
        //     }
        // }
    })()
)

@observer
export class Visualizer extends React.Component {
    render() {
        return (
            <div className="background audio">
                <svg
                    preserveAspectRatio="none"
                    id="visualizer"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <mask id="mask">
                            <g id="maskGroup" />
                        </mask>
                        <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                style={{ stopColor: '#fff', stopOpacity: 1 }}
                            />
                            <stop
                                offset="30%"
                                style={{ stopColor: '#fff', stopOpacity: 1 }}
                            />
                            <stop
                                offset="100%"
                                style={{ stopColor: '#fff', stopOpacity: 1 }}
                            />
                        </linearGradient>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="url(#gradient)"
                        mask="url(#mask)"
                    />
                </svg>
            </div>
        )
    }
}

@observer
export class VisualizerSettings extends React.Component {
    constructor(props) {
        super(props)
        this.toggleRunning = ::this.toggleRunning
        this.changeSpeed = ::this.changeSpeed
        this.changeColor = ::this.changeColor
    }

    changeSpeed(event) {
        state.updateSpeed = parseInt(event.target.value)
    }

    changeColor(color) {
        state.color = color.rgb
    }

    toggleRunning() {
        if (state.running) {
            state.stop()
        } else {
            state.start()
        }
    }

    toggle() {
        state.enabled = !state.enabled
        state.stop()
    }

    render() {
        const classes = classnames({
            success: state.running,
        })

        return (
            <fieldset className="inputs">
                <div className="header">
                    <div className="name">visualizer</div>
                    <input
                        type="checkbox"
                        checked={state.enabled}
                        onChange={::this.toggle}
                    />
                </div>
                <div className="input">
                    <label>update speed</label>
                    <input
                        type="range"
                        className="reverse"
                        min="1"
                        max="100"
                        step="4"
                        value={state.updateSpeed}
                        onChange={this.changeSpeed}
                    />
                </div>
                <div className="input">
                    <label>listening</label>
                    <button
                        className={classes}
                        disabled={!state.enabled}
                        onClick={this.toggleRunning}
                    >
                        {state.running ? 'on' : 'off'}
                    </button>
                </div>
            </fieldset>
        )
    }
}
