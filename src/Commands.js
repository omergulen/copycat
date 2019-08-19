import React, { Component } from 'react'
import { eventColors } from './Constants';

export default class Commands extends Component {

  _commandsHandler() {
    var commands = [];
    for (var key in this.props.commands) {
      var event = this.props.commands[key];
      if (event) {
        commands.push(
          <div className="app-action" style={{
            backgroundColor: eventColors[event.type]
          }}>
            <div className="app-action-type">{event.type.toUpperCase()}</div>
            <div className="app-action-target">{event.selector}</div>
            {event.data && event.data.key ? <div className="app-action-info">{event.data.key}</div> : ''}
            {event.data && event.data.mousePos && event.data.mouseTarget ? <div className="app-action-info">{'(' + event.data.mousePos.x + ',' + event.data.mousePos.y + ') to (' + event.data.mouseTarget.x + ',' + event.data.mouseTarget.y + ')'}</div> : ''}
            <button
              id={key}
              className="app-action-remove"
              onClick={(e) => {
                this.props.remove(e.target.id);
              }}>x</button>
          </div>
        )
      }
    }

    return (

      <div>
        {commands.reverse()}
      </div>

    )

  }

  render() {

    return (

      <div className={"app-actions"}>
        {this._commandsHandler()}
      </div>

    )
  }
}
