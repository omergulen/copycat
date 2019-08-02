import React, { Component } from 'react'

export default class Commands extends Component {

    _commandsHandler() {
        var commands = [];
        for (var key in this.props.commands) {
            var event = this.props.commands[key];
            if (event) {
                commands.push(
                    <li className={'command'} key={'command' + key}>
                        <div className={'command-header'}>
                            <p className={'event ' + event.type}>{event.type}</p>
                            <button
                                className="extensionBtn remove"
                                key={'remove' + key}
                                id={'remove' + key}
                                onClick={(e) => {
                                    this.props.remove(e.target.id.slice(6));
                                }}>
                                X
                        </button>
                        </div>
                        <div className={'command-body'}>
                            {event.selector ? <p className={'selector'}>{event.selector}</p> : ''}
                            {event.data ? <p className={'data'} >{event.data}</p> : ''}
                        </div>
                    </li>
                )
            }
        }
        return (
            <ul className={'commands'}>
                {commands.reverse()}
            </ul>
        )

    }

    render() {
        return (
            <div>
                {this._commandsHandler()}
            </div>
        )
    }
}
