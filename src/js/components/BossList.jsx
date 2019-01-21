import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { persist } from 'mobx-persist'

import { hydrate } from '../util/storage'


@observer
class BossView extends React.Component {
    render() {
        const item = this.props.item
        const classes = classnames(item.name, {
            boss: true,
            active: item.completed,
        })
        return <div
            className={ classes }
            onClick={ () => this.props.onClick(item.name) }
        ></div>
    }
}


@observer
export class BossList extends React.Component {
    constructor(props) {
        super(props)
        this.handleClick = ::this.handleClick
    }

    handleClick(boss) {
        this.props.bosses.forEach(i => {
            if (i.name === boss) {
                i.completed = !i.completed
            }
        })
    }

    render() {
        const bosses = this.props.bosses.map((boss, index) => {
            return <BossView
                item={ boss }
                key={ index }
                onClick={ this.handleClick }
            />
        })
        return <div className="bosses">
            { bosses }
        </div>
    }
}
