import React, { Component } from 'react'

export default class Commands extends Component {

    _commandsHandler() {
        var commands = [];
        for (var key in this.props.commands) {
            var event = this.props.commands[key];
            if (event) {
                commands.push(
                    /*
                    <div className="app-actions">
                    <div className="app-action" >
                      <div className="app-action-type">CLICK</div>
                      <div className="app-action-target">.header > .logo span</div>
                      <button className="app-action-remove">x</button>
                    </div>
                    <div className="app-action" >
                      <div className="app-action-type">MOUSEENTER</div>
                      <div className="app-action-target">#banner > img</div>
                      <div className="app-action-info">Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore eum ipsa et ea molestiae id beatae dignissimos unde, consectetur eius laborum? Repellendus aperiam iusto ea velit numquam itaque, cum officia?</div>
                      <button className="app-action-remove">x
                </button>
                    </div>
                  </div>*/
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
                            {event.data && event.data.key ? <p className={'data'} >{event.data.key}</p> : ''}
                            {event.data && event.data.mousePos ? <p className={'data'}>{'(' + event.data.mousePos.x + ',' + event.data.mousePos.y + ')'}{event.data.mouseTarget ? ' to (' + event.data.mouseTarget.x + ',' + event.data.mouseTarget.y + ')' : ''}</p> : ''}
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
