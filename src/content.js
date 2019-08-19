/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import unique from 'unique-selector';
import beautify from 'js-beautify';

import { keyCommands, captureEvents, selectorOptions, storageKey, combinationKeys } from './Constants';
import Generator from './Generator';
import Commands from './Commands';

const app = document.createElement('div');
app.id = "testing-extension";

class Main extends React.Component {

  constructor(props) {
    // Inheritance
    super(props);

    // Method bindings
    this.verify = this.verify.bind(this);
    this.prepareToAddStorage = this.prepareToAddStorage.bind(this);

    // Initial state definition
    this.state = {
      step: 1,
      paused: false
    };

    // Message listener for "verify-*" events
    chrome.runtime.onMessage.addListener(
      (request, sender, sendResponse) => {
        if (request.verify) {
          this.verify(request.data)
        }
      }
    );
  }

  componentDidMount = () => {
    // Extension toggle handler
    chrome.storage.sync.get(['toggle', 'paused'], function (res) {
      app.style.display = res.toggle;
      if (res.toggle === 'block') {
        document.body.className += " toggle";
      } else {
        document.body.className = document.body.className.replace("toggle", "").trim();
      }
    });

    // Extension "puased" state updater
    let self = this;
    chrome.storage.sync.get('paused', function (res) {
      self.setState({
        paused: res.paused
      })
    });

    // Extension "recording" state handler
    chrome.storage.sync.get('recording', function (res) {
      switch (res.recording) {
        case 1:
          self.resetHandler();
          break;
        case 2:
          if (self.state.paused) {
            self.pauseHandler();
          } else {
            self.recordHandler();
          }
          break;
        case 3:
          self.stopHandler();
          break;
        default:
          self.resetHandler();
          break;
      }
    });

    // STORAGE (HISTORY)
    chrome.storage.sync.get([storageKey], function (result) {
      var storeArray = result[storageKey] ? result[storageKey] : [];
      self.setState({ storeArray });
    });
  }

  // Sends message to background.js
  sendMessageToBackground = (msg) => {
    chrome.runtime.sendMessage({ downloadContent: msg }, function (response) {
      return;
    });
  }

  // Handling "verify-*" actions
  verify(data) {
    let selection = document.getSelection();
    let node = selection.baseNode.parentNode;
    let newEntry;
    switch (data.menuItemId) {
      case "verify-text":
        newEntry = {
          type: data.menuItemId,
          selector: unique(node, selectorOptions),
          data: {
            key: selection.baseNode.textContent
          }
        };
        break;
      case "verify-dom":
        newEntry = {
          type: data.menuItemId,
          selector: unique(node, selectorOptions),
          data: ""
        };
        break;
      case "verify-link":
        newEntry = {
          type: data.menuItemId,
          selector: unique(node, selectorOptions),
          data: {
            key: data.linkUrl
          }
        };
        break;
      default:
        // if the action is "verify" but not defined, it logs to the console WTF!
        console.log("WTF!")
        return;
    }
    this.addToStorage(newEntry);
  }

  // Is "#element" is in "el"
  isRecursivelyInId(el, id) {
    if (el.id === id) return true;

    while (el.parentNode) {
      el = el.parentNode;
      if (el.id === id) {
        return true;
      }
    }
    return false;
  }

  // .length  without nulls
  calculateStoreLengthWithoutNulls = () => {
    let l = 0;
    this.state.storeArray.forEach(element => {
      if (element) {
        l++;
      }
    });
    return l;
  }

  // Distance of 2 coordinates
  distance = (a, b) => {
    return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2))
  }

  // Adding prepared actions to state and store
  addToStorage = (entry) => {
    let self = this;
    chrome.storage.sync.get(storageKey, function (result) {
      var storeArray = result[storageKey] ? result[storageKey] : {};
      let id = Object.keys(storeArray).length

      let keyCheckObject = storeArray[id - 1];

      if (keyCheckObject) {

        switch (keyCheckObject.type) {

          case 'mousedown':

            if (entry.type === 'mouseup') {
              let r = self.distance(entry.data.mousePos, keyCheckObject.data.mousePos);
              if (r > 10) {
                keyCheckObject.type = 'drag-and-drop'
                keyCheckObject.data.mouseTarget = { x: entry.data.mousePos.x, y: entry.data.mousePos.y };
              } else {
                keyCheckObject.type = 'click';
              }
            }
            else if (entry.type === 'page-change') {
              keyCheckObject.type = 'click-page-change';
            }
            else if (entry.type === 'mousedown') {
              keyCheckObject.type = 'click';
              storeArray[id + 1] = entry;
            }
            else {
              keyCheckObject.type = entry.type;
              keyCheckObject.data = entry.data;
              keyCheckObject.selector = entry.selector;
            }
            break;

          case 'mouseup':

            storeArray[id] = entry;
            storeArray[id].type = 'click';
            break;

          case 'click':

            if (entry.type === 'page-change') {
              keyCheckObject.type = 'click-page-change';
            } else if (entry.type === 'mouseup') {
              storeArray[id] = entry;
              storeArray[id].type = 'click';
            } else {
              storeArray[id] = entry;
            }
            break;

          case 'keydown':

            if (!keyCommands.includes(keyCheckObject.data.key) && keyCheckObject.selector === entry.selector && !keyCommands.includes(entry.data.key)) {
              keyCheckObject.data.key += entry.data.key;
            } else if (combinationKeys.includes(keyCheckObject.data.key) && keyCheckObject.selector === entry.selector && entry.data.commands && !combinationKeys.includes(entry.data.key)) {
              entry.data.commands.forEach(command => {
                keyCheckObject.type = 'combined-keydown';
                keyCheckObject.data.key += '+' + entry.data.key.toUpperCase();
              });
            } else if (entry.type === 'mouseup') {
              storeArray[id] = entry;
              storeArray[id].type = 'click';
            } else {
              storeArray[id] = entry;
            }
            break;

          default:

            storeArray[id] = entry;
            break;
        }
      } else {

        storeArray[id] = entry;
      }

      var jsonObj = {};

      if (id === 0) {
        jsonObj['initURL'] = document.URL;
      }
      jsonObj[storageKey] = storeArray;

      // update the state
      self.setState({ storeArray });

      // update the store
      chrome.storage.sync.set(jsonObj, function () {
        return
      });
    });
  }

  // Prepare actions before adding them to state and store
  prepareToAddStorage(e) {
    if (!this.isRecursivelyInId(e.target, 'testing-extension')) {
      let commands = [];
      if (e.ctrlKey) commands.push('Ctrl');
      if (e.metaKey) commands.push('Meta');
      if (e.altKey) commands.push('Alt');
      if (e.shiftKey) commands.push('Shift');

      let code = e.key ? e.key : ''
      let mousePos = e.pageX ? { x: e.pageX, y: e.pageY } : ''
      let selector = unique(e.target, selectorOptions);

      let newEntry = {
        type: e.type,
        selector: selector,
        data: {
          key: code,
          mousePos,
          commands
        }
      };

      setTimeout(() => {
        this.addToStorage(newEntry);
      }, 100);
    }

  }

  // Remove specific action from state and store
  remove = (id) => {
    let self = this;
    chrome.storage.sync.get(storageKey, function (result) {
      var storeArray = result[storageKey] ? result[storageKey] : {};

      delete storeArray[id];

      var jsonObj = {};
      jsonObj[storageKey] = storeArray;

      // uptade the state
      self.setState({ storeArray })

      chrome.storage.sync.set(jsonObj, function () {
        return;
      });
    });
  }

  // Start recording
  record = () => {
    captureEvents.forEach(event => {
      window.addEventListener(event, this.prepareToAddStorage)
    });

    // Special case "page-change" event handler
    window.onbeforeunload = (e) => {
      let newEntry = {
        type: 'page-change',
        selector: undefined,
        data: undefined
      };
      setTimeout(() => this.addToStorage(newEntry), 105);
      // this.addToStorage(newEntry);
    }
    this.setState({ paused: false });
  }

  // Stop recording
  stop = () => {
    window.onbeforeunload = null;
    captureEvents.forEach(event => {
      window.removeEventListener(event, this.prepareToAddStorage)
    });
  }

  // Reset state and the store
  reset = () => {
    this.setState({ storeArray: [] }, () => {
      var jsonObj = {};
      jsonObj[storageKey] = [];
      chrome.storage.sync.set(jsonObj, function () {
        return;
      });
    })
  }

  // Map actions to jest-puppeteer code and call download prompt method (in background.js)
  save = () => {
    let initURL = '';
    chrome.storage.sync.get('initURL', (res) => {
      initURL = res.initURL;
    })
    let self = this;
    chrome.storage.sync.get([storageKey], function (result) {
      var storeArray = result[storageKey] ? result[storageKey] : [];
      var gen = new Generator();
      let code = gen.generatePuppeteerCode(storeArray, initURL);
      let beautifiedCode = beautify(code, { indent_size: 2, space_in_empty_paren: true });
      self.sendMessageToBackground(beautifiedCode);
    });
  }

  // Record button handler
  recordHandler = () => {
    this.record();
    this.storeRecordingState(2);
  }

  // Stop button handler
  stopHandler = () => {
    this.stop();
    this.storeRecordingState(3);
  }

  // Resume button handler
  resumeHandler = () => {
    this.record();
    this.storePausedState(false);
    this.storeRecordingState(2);
  }

  // Pause button handler
  pauseHandler = () => {
    this.stop();
    this.storePausedState(true);
    this.storeRecordingState(2);
  }

  // Reset button handler
  resetHandler = () => {
    this.reset();
    this.storeRecordingState(1);
  }

  // Save recording state
  storeRecordingState = (recordingState) => {
    let self = this;
    chrome.storage.sync.set({ recording: recordingState }, () => {
      self.setState({ step: recordingState });
    })
  }

  // Save recording state
  storePausedState = (paused) => {
    let self = this;
    chrome.storage.sync.set({ paused }, () => {
      self.setState({ paused });
    })
  }

  // Render the DOM
  render() {
    return (
      <div className={'my-extension'}>
        <div className={`app app-step-${this.state.step}`}>
          <div className="app-controls">
            <div className="app-action-step-1">
              <h3 className="app-title">Not Recording</h3>
              <div className="app-buttons">
                <button onClick={this.recordHandler} className="app-record-button">Record</button>
              </div>
              <h6 className="app-subtitle pulse">Click "Record" to start recording...</h6>
            </div>
            <div className="app-action-step-2">
              <h3 className="app-subtitle">{this.state.paused ? 'Paused' : <span className="app-subtitle-recording">Recording</span>}</h3>
              <h2 className="app-title">{this.state.storeArray ? this.calculateStoreLengthWithoutNulls() : 0} Actions</h2>
              <div className="app-buttons">
                {this.state.paused ?
                  <button onClick={this.resumeHandler} className="app-ghost-button for-resume">
                    Resume
                  </button>
                  :
                  <button onClick={this.pauseHandler} className="app-ghost-button for-pause">
                    Pause
                  </button>
                }
                <button onClick={this.stopHandler} className="app-ghost-button for-stop">
                  Stop
                </button>
              </div>
            </div>
            <div className="app-action-step-3">
              <h3 className="app-subtitle">Done!</h3>
              <h2 className="app-title">{this.state.storeArray ? this.calculateStoreLengthWithoutNulls() : 0} Actions</h2>
              <div className="app-buttons">
                <button onClick={this.resetHandler} className="app-ghost-button for-reset">
                  Reset
          </button>
                <button onClick={this.save} className="app-ghost-button for-save">
                  Save
          </button>
              </div>
            </div>
          </div>
          {this.state.storeArray ? <Commands remove={this.remove} btnClickHndlr={this.buttonClickHandler} commands={this.state.storeArray} /> : ''}
        </div>
      </div>
    )
  }
}

// Add extension to the page
document.body.appendChild(app);
ReactDOM.render(<Main />, app);

// Toggle listener (Extension icon click handler)
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      toggle();
    }
  }
);

// Toggle handler 
function toggle() {
  if (app.style.display === "none") {
    chrome.storage.sync.set({ toggle: 'block' }, function () {

      app.style.display = "block";
      document.body.className += " toggle";
    });
  } else {
    chrome.storage.sync.set({ toggle: 'none' }, function () {

      app.style.display = "none";
      document.body.className = document.body.className.replace("toggle", "").trim();
    });
  }
}