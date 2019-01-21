import React from 'react'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react'


const ItemView = observer(({ item }) =>
    <div className={ classnames({
        item: true,
        active: item.completed,
    }) }>
        <img
            src={ `/img/items/${item.name}.png` }
            onClick={ () => item.completed = !item.completed }
        />
    </div>
)

@observer
export class ItemList extends React.Component {
    render() {
        const items = this.props.items.map((item, index) => {
            return <ItemView item={ item } key={ index } />
        })
        return <div className="items">{ items }</div>
    }
}
