import React from 'react'
import classnames from 'classnames'
import { observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'
import { storage } from '../util/storage'
import { SettingsWindow } from '../util/SettingsWindow'
import ColorPicker from '../util/ColorPicker'

import * as SpotifyWebApi from 'spotify-web-api-js'

const spotifyApi = new SpotifyWebApi()

class SpotifyState {
  @persist @observable enabled = false
  @persist @observable albumArt = ''
  @persist @observable artistName = ''
  @persist @observable song = ''
  @persist @observable offline = true
  @persist('object') @observable background = {
    r: 0,
    g: 0,
    b: 0,
    a: 0.5,
  }
  @persist('object') @observable font = {
    r: 255,
    g: 255,
    b: 255,
    a: 0.9,
  }
  @persist @observable accessToken = ''
  @persist @observable username = ''

  @action update() {
    if (!this.accessToken) {
      return
    }
    spotifyApi.setAccessToken(this.accessToken)

    spotifyApi.getMyCurrentPlaybackState({}, (err, data) => {
      if (err) {
        const error = JSON.parse(err.responseText).error
        this.offline = error.message
        // switch(error.status) {
        //   case 401:
        //     this.getAccessToken(true)
        //   default:
        // }
        return
      }

      if (!data) {
        this.offline = 'player offline'
        return
      }

      this.albumArt = data.item.album.images.find(i => i.height == 300).url
      this.artistName = data.item.artists[0].name
      this.song = data.item.name
      this.offline = false
    })
  }

  @action getAccessToken(clear=false) {
    let url = `/api/spotify${clear?'/clear':''}`
    console.log(url)
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data['auth']) {
          const window_handle = window.open(data['auth'])
        }
        else {
          this.accessToken = data['access_token']
          this.update()
        }
      })
  }
}

window['getAccessToken'] = () => state.accessToken
window['setAccessToken'] = (accessToken) => state.accessToken = accessToken

const state = storage('spotify', new SpotifyState(), () => state.update())

@observer
export class Spotify extends React.Component {
  render() {
    if (!state.enabled) {
      return ''
    }

    let contents

    const bg = state.background
    const fg = state.font

    const style = {
      backgroundColor: `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${bg.a})`,
      color: `rgba(${fg.r}, ${fg.g}, ${fg.b}, ${fg.a})`,
    }

    if (state.offline) {
      contents = <div className="offline">{state.offline}</div>
    } else {
      contents = (
        <>
          <div className="head">now playing</div>
          <hr />
          <div className="now-playing">
            <div className="art">
              <img src={state.albumArt} width="100" />
            </div>
            <div className="artist">{state.artistName}</div>
            <div className="song">{state.song}</div>
          </div>
          <hr />
        </>
      )
    }

    return (
      <div
        className="spotify"
        style={style}
        onClick={() => console.log('do a thing')}
      >
        {contents}
      </div>
    )
  }
}

@observer
export class SpotifySettings extends React.Component {
  update = undefined

  componentDidMount() {
    this.update = setInterval(() => state.update(), 20 * 1000)
  }

  componentWillUnmount() {
    clearInterval(this.update)
  }

  changeBackground(background) {
    state.background = background.rgb
  }

  changeFontColor(font) {
    state.font = font.rgb
  }

  changeEnabled(event) {
    state.enabled = !state.enabled
    state.update()
  }

  fetchToken(event) {
    state.getAccessToken()
  }

  render() {
    return (
      <SettingsWindow name="spotify">
        <div className="inputs">
          <div className="input">
            <label>enabled</label>
            <input
              type="checkbox"
              checked={state.enabled}
              onChange={this.changeEnabled}
            />
          </div>
          {/*<div className="input">
            <label>username</label>
            <input
              type="text"
              value={state.username}
              onChange={this.changeUsername}
            />
          </div>*/}
          {/*<div className="input">
            <label>access token</label>
            <input
              type="text"
              value={state.accessToken}
              onChange={this.changeAccessToken}
            />
          </div>*/}
          <div className="input">
            <label>token ({state.accessToken ? '✔' : '✖'})</label>
            <button
              onClick={this.fetchToken}
            >
              fetch token
            </button>
          </div>
          <div className="input">
            <label>background</label>
            <ColorPicker
              color={state.background}
              onChange={this.changeBackground}
            />
          </div>
          <div className="input">
            <label>font color</label>
            <ColorPicker color={state.font} onChange={this.changeFontColor} />
          </div>
        </div>
      </SettingsWindow>
    )
  }
}
