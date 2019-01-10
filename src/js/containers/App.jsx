import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'
import ColorPicker from 'rc-color-picker'

import { ItemList, ItemListSettings } from '../components/ItemList'
import { BossList, BossListSettings } from '../components/BossList'
import { Stopwatch, StopwatchSettings } from '../components/Stopwatch'
import Container from '../util/container'
import { hexToRgb } from '../util/functions'

import { localforage, hydrate } from '../util/storage'


class GeneralState {
    @persist('object') @observable background = {
        color: "#DDDDDD",
        alpha: 100,
    }
}
const state = new GeneralState()
hydrate('general', state)


@observer
class GeneralSettings extends React.Component {

    handleBackgroundColor(background) {
        state.background = background
    }

    handleReset() {
        localforage.clear()
        window.location.reload(false)
    }

    render() {
        return <fieldset className="general">
            <legend>general</legend>
            <div className="inputs">
            <div className="input">
                <label>background color</label>
                <ColorPicker
                    color={ state.background.color }
                    alpha={ state.background.alpha }
                    onChange={ ::this.handleBackgroundColor }
                />
            </div>
            </div>
            <div className="commands">
                <button onClick={ ::this.handleReset }>reset state</button>
            </div>
        </fieldset>
    }
}


@observer
export default class App extends Container {
    className = 'app'

    handleResize() {
        const body = document.body
        localforage.setItem('window', {
            'width': body.clientWidth,
            'height': body.clientHeight,
        })
    }

    componentDidMount() {
        document.querySelector('#mount').classList.add('app')
        window.addEventListener('resize', this.handleResize)
        this.handleResize()
    }

    componentWillUnmount() {
        document.querySelector('#mount').classList.remove('app')
        window.removeEventListener('resize', this.handleResize)
    }

    render() {
        const { r, g, b } = hexToRgb(state.background.color)
        const a = state.background.alpha / 100

        return <div className="container">
            <div className="display" style={{
                backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`,
            }}>
                <ItemList />
                <BossList />
                <Stopwatch />
            </div>
            <div className="settings">
                <GeneralSettings />
                <ItemListSettings />
                <BossListSettings />
                <StopwatchSettings />
            </div>
        </div>
    }
}
