import React from 'react'


export default class Container extends React.Component {
    className = ''
    mountElement = document.querySelector('#mount')

    componentDidMount() {
        this.mountElement.classList.add(this.className)
    }

    componentWillUnmount() {
        this.mountElement.classList.remove(this.className)
    }
}
