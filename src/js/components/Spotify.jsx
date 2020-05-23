import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'


const urlify = obj => Object
    .keys(obj)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
    .join('&')


@observer
export class Spotify extends React.Component {

    componentDidMount() {
        // const url = `https://accounts.spotify.com/authorize?${urlify({
        //     response_type: 'code',
        //     client_id: '6272a96550d4417abfcbe9d5ed774894',
        //     scope: [
        //         'user-read-private',
        //         'user-read-email'
        //     ].join(' '),
        //     redirect_uri: 'http://localhost:5000/app'
        // })}`
        // console.log(url)
        // fetch(url)
        //   .then(response => response.json())
        //   .then(data => console.log(data));
    }

    render() {
        return <div
            className="spotify"
            onClick={ () => console.log("panic and shit your pants") }
        >
            <div className="now-playing">
                <div className="head">now playing</div>
                <div className="art"></div>
                <div className="artist"></div>
                <div className="song"></div>
            </div>
        </div>
    }
}
