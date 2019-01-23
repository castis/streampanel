import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'
import ColorPicker from 'rc-color-picker'

import { ItemList, ItemListSettings } from '../components/ItemList'
import { BossList, BossListSettings } from '../components/BossList'
import { Stopwatch, StopwatchSettings } from '../components/Stopwatch'
import { Gamepad, GamepadSettings } from '../components/Gamepad'
import { hexToRgb } from '../util/functions'

import { localforage, hydrate } from '../util/storage'


import { SuperMetroid, SuperMetroidSettings } from '../games/SuperMetroid'


class State {
    // double tap
    @observable abortLock = false
    @persist('object') @observable bg1 = {
        color: "#0960c2",
        alpha: 30,
    }
    @persist('object') @observable bg2 = {
        color: "#da7c3e",
        alpha: 40,
    }
    @persist @observable updateSpeed = 20
    @persist @observable Z = 0.01
}
const state = new State()
hydrate('general', state)


@observer
class GeneralSettings extends React.Component {

    constructor(props) {
        super(props)
        this.reset = ::this.reset
        this.abortReset = ::this.abortReset
    }

    changeBg1(bg1) {
        state.bg1 = bg1
    }

    changeBg2(bg2) {
        state.bg2 = bg2
    }

    reset() {
        if (state.abortLock) {
            this.abortReset()
            localforage.clear()
            window.location.reload(false)
        } else {
            state.abortLock = true
        }
    }

    abortReset() {
        state.abortLock = false
    }

    changeSpeed(event) {
        const value = parseInt(event.target.value || 1)
        state.updateSpeed = Math.max(1, Math.min(value, 100))
    }

    render() {
        let buttons = [
            <button key="1" onClick={ this.reset }>{ state.abortLock ? 'confirm' : 'hard reset' }</button>
        ]

        if (state.abortLock) {
            buttons.push(<button key="2" onClick={ this.abortReset }>cancel</button>)
        }

        return <fieldset className="general">
            <legend>general</legend>
            <div className="inputs">
                <div className="input">
                    <label>hold shift to change and scroll stars</label>
                </div>
                <div className="input">
                    <label>background color 1</label>
                    <ColorPicker
                        color={ state.bg1.color }
                        alpha={ state.bg1.alpha }
                        onChange={ ::this.changeBg1 }
                    />
                </div>
                <div className="input">
                    <label>background color 2</label>
                    <ColorPicker
                        color={ state.bg2.color }
                        alpha={ state.bg2.alpha }
                        onChange={ ::this.changeBg2 }
                    />
                </div>
                <div className="input">
                    <label>update speed</label>
                    <input
                        type="range"
                        className="reverse"
                        min="1"
                        max="100"
                        value={ state.updateSpeed }
                        onChange={ this.changeSpeed }
                    />
                </div>
            </div>
            <div className="commands">
                { buttons }
            </div>
        </fieldset>
    }
}


class Starfield {
    constructor() {
        // remove frame margin and scrollbars when maxing out size of canvas
        document.body.style.margin = "0px";
        document.body.style.overflow = "hidden";

        // get dimensions of window and resize the canvas to fit
        var width = window.innerWidth,
            height = window.innerHeight,
            canvas = document.getElementById("c"),
            mousex = width/2, mousey = height/2;
        canvas.width = width;
        canvas.height = height;

        // get 2d graphics context and set global alpha
        var G=canvas.getContext("2d");
        G.globalAlpha=0.25;

        // setup aliases
        var Rnd = Math.random,
            Sin = Math.sin,
            Floor = Math.floor;

        // constants and storage for objects that represent star positions
        var warpZ = 12,
            units = 2000,
            stars = [],
            cycle = 0

        state.Z = 0.1 + (1/25 * 2);

        let lock = false
        document.addEventListener('mousemove', function(e) {
            if (lock == true) {
                mousex = e.clientX;
                mousey = e.clientY;
            }
        }, false);

        document.addEventListener('keydown', function(e) {
            if (e.keyCode == 16) {
                lock = true
            }
        }, false);

        document.addEventListener('keyup', function(e) {
            if (e.keyCode == 16) {
                lock = false
            }
        }, false);


        // addCanvasEventListener("mousemove", );

        function wheel (e) {
            if (lock == false) {
                return
            }
           var delta = 0;
           if (e.detail)
           {
              delta = -e.detail / 3;
           }
           else
           {
              delta = e.wheelDelta / 120;
           }
           var doff = (delta/25);
           if (delta > 0 && state.Z+doff <= 0.5 || delta < 0 && state.Z+doff >= 0.01)
           {
              state.Z += (delta/25);
              // console.log(delta +" " +state.Z);
           }
        }
        document.addEventListener("DOMMouseScroll", wheel);
        document.addEventListener("mousewheel", wheel);

        // function to reset a star object
        function resetstar(a)
        {
           a.x = (Rnd() * width - (width * 0.5)) * warpZ;
           a.y = (Rnd() * height - (height * 0.5)) * warpZ;
           a.z = warpZ;
           a.px = 0;
           a.py = 0;
        }

        // initial star setup
        for (var i=0, n; i<units; i++)
        {
           n = {};
           resetstar(n);
           stars.push(n);
        }

        // star rendering anim function
        var rf = function()
        {
           // clear background
           // G.fillStyle = "#000";
           // G.fillRect(0, 0, width, height);
           G.clearRect(0, 0, width, height);

           // mouse position to head towards
           var cx = (mousex - width / 2) + (width / 2),
               cy = (mousey - height / 2) + (height / 2);

           // update all stars
           var sat = Floor(state.Z * 500);       // Z range 0.01 -> 0.5
           if (sat > 100) sat = 100;
           for (var i=0; i<units; i++)
           {
              var n = stars[i],            // the star
                  xx = n.x / n.z,          // star position
                  yy = n.y / n.z,
                  e = (1.0 / n.z + 1) * 2;   // size i.e. z

              if (n.px !== 0)
              {
                 // hsl colour from a sine wave
                 // G.strokeStyle = "hsl(" + ((cycle * i) % 360) + "," + sat + "%,80%)";
                 G.strokeStyle = "rgba(255,255,255,1)";
                 G.lineWidth = e;
                 G.beginPath();
                 G.moveTo(xx + cx, yy + cy);
                 G.lineTo(n.px + cx, n.py + cy);
                 G.stroke();
              }

              // update star position values with new settings
              n.px = xx;
              n.py = yy;
              n.z -= state.Z;

              // reset when star is out of the view field
              if (n.z < state.Z || n.px > width || n.py > height)
              {
                 // reset star
                 resetstar(n);
              }
           }

           // colour cycle sinewave rotation
           cycle += 0.01;

           setTimeout(rf, state.updateSpeed);
        };
        rf();
    }
}


@observer
export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.resize = ::this.resize
    }

    resize() {
        const body = document.body
        localforage.setItem('window', {
            'width': body.clientWidth,
            'height': body.clientHeight,
        })
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize)
        this.resize()

        const starfield = new Starfield()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    render() {
        const bg1 = hexToRgb(state.bg1.color)
        const a1 = state.bg1.alpha / 100
        const rgba1 = `rgba(${bg1.r}, ${bg1.g}, ${bg1.b}, ${a1})`

        const bg2 = hexToRgb(state.bg2.color)
        const a2 = state.bg2.alpha / 100
        const rgba2 = `rgba(${bg2.r}, ${bg2.g}, ${bg2.b}, ${a2})`

        return <div className="app">
            <div className="background static" />
            <canvas id="c" className="background" />
            <div className="background" style={{
                backgroundImage: `linear-gradient(${rgba1}, ${rgba2})`,
            }} />
            <div className="display">
                <SuperMetroid />
                <Stopwatch />
                <Gamepad />
            </div>
            <div className="settings">
                <GeneralSettings />
                <SuperMetroidSettings />
                <StopwatchSettings />
                <GamepadSettings />
            </div>
        </div>
    }
}
