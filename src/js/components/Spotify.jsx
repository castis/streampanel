import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

const urlify = obj =>
    Object.keys(obj)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
        .join('&')

@observer
export class Spotify extends React.Component {
    componentDidMount() {

    }

    render() {
        return (
            <div
                className="spotify"
                onClick={() => console.log('do a thing')}
            >
                <div className="now-playing">
                    <div className="head">now playing</div>
                    <div className="art" />
                    <div className="artist" />
                    <div className="song" />
                </div>
            </div>
        )
    }
}
