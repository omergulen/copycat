/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import unique from 'unique-selector';

import { keyCommands, captureEvents, selectorOptions, storageKey, combinationKeys } from './Constants';
import Generator from './Generator';
import "./content.css";

import Commands from './Commands';


const app = document.createElement('div');
app.id = "testing-extension";

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.verify = this.verify.bind(this);
    this.prepareToAddStorage = this.prepareToAddStorage.bind(this);
    this.state = {
      step: 1,
      paused: false
    };

    chrome.runtime.onMessage.addListener(
      (request, sender, sendResponse) => {
        if (request.verify) {
          this.verify(request.data)
        }
      }
    );
  }

  componentDidMount = () => {
    // APP STYLE TOGGLE STATE
    chrome.storage.sync.get(['toggle', 'paused'], function (res) {
      console.log(res.paused)
      app.style.display = res.toggle;
      if (res.toggle === 'block') {
        document.body.className += " toggle";
      } else {
        document.body.className = document.body.className.replace("toggle", "").trim();
      }
    });

    let self = this;
    chrome.storage.sync.get('paused', function (res) {
      self.setState({
        paused: res.paused
      })
    });
    // RECORDING STATE
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

  sendMessageToBackground = (msg, testName) => {
    chrome.runtime.sendMessage({ downloadContent: msg, testName: testName }, function (response) {
      console.log('downloadFile content sent to bg.js', response.text);
    });
  }

  verify(data) {
    let selection = document.getSelection();
    let node = selection.baseNode.parentNode;
    let newEntry;
    switch (data.menuItemId) {
      case "verify-text":
        // Get text from document.getSelection();
        // var text = baseNode.textContent.trim().slice(selection.baseOffset, selection.extentOffset);
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
        console.log("WTF")
        return;
    }
    this.addToStorage(newEntry);
  }

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

  distance = (a, b) => {
    return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2))
  }

  addToStorage = (entry) => {
    let self = this;
    chrome.storage.sync.get(storageKey, function (result) {
      var storeArray = result[storageKey] ? result[storageKey] : {};
      let id = Object.keys(storeArray).length

      let keyCheckObject = storeArray[id - 1];

      if (keyCheckObject) {
        console.log(entry)
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

          case 'click':

            if (entry.type === 'page-change') {
              keyCheckObject.type = 'click-page-change';
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
            } else {
              storeArray[id] = entry;
            }
            break;

          default:
            console.log(entry);
            storeArray[id] = entry;
            break;
        }
      } else {
        console.log("else", entry);
        storeArray[id] = entry;
      }

      var jsonObj = {};

      if (id === 0) {
        jsonObj['initURL'] = document.URL;
      }
      jsonObj[storageKey] = storeArray;

      // update the state
      self.setState({ storeArray });

      chrome.storage.sync.set(jsonObj, function () {
        return
      });
    });
  }

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
      if (!selector) {
        console.log(e.target);
      }
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
        console.log("Removed item: " + id + " array item");
      });
    });
  }

  record = () => {
    captureEvents.forEach(event => {
      window.addEventListener(event, this.prepareToAddStorage)
    });
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

  stop = () => {
    window.onbeforeunload = null;
    captureEvents.forEach(event => {
      window.removeEventListener(event, this.prepareToAddStorage)
    });
  }

  reset = () => {
    this.setState({ storeArray: [] }, () => {
      var jsonObj = {};
      jsonObj[storageKey] = [];
      chrome.storage.sync.set(jsonObj, function () {
        console.log("Storage has reset!");
      });
    })
  }

  save = () => {
    let initURL = '';
    chrome.storage.sync.get('initURL', (res) => {
      initURL = res.initURL;
    })
    let self = this;
    chrome.storage.sync.get([storageKey], function (result) {
      var storeArray = result[storageKey] ? result[storageKey] : [];
      var gen = new Generator();
      // console.log(gen.generatePuppeteerCode(storeArray, initURL));
      self.sendMessageToBackground(gen.generatePuppeteerCode(storeArray, initURL), "test_name.js");
    });
  }

  recordHandler = () => {
    this.record();
    this.storeRecordingState(2);
  }

  stopHandler = () => {
    this.stop();
    this.storeRecordingState(3);
  }

  resumeHandler = () => {
    this.record();
    this.storePausedState(false);
    this.storeRecordingState(2);
  }

  pauseHandler = () => {
    this.stop();
    this.storePausedState(true);
    this.storeRecordingState(2);
  }

  resetHandler = () => {
    this.reset();
    this.storeRecordingState(1);
  }

  storeRecordingState = (recordingState) => {
    let self = this;
    chrome.storage.sync.set({ recording: recordingState }, () => {
      self.setState({ step: recordingState });
    })
  }

  storePausedState = (paused) => {
    let self = this;
    chrome.storage.sync.set({ paused }, () => {
      self.setState({ paused });
    })
  }

  render() {
    return (
      <div className={'my-extension'}>
        <div className={`app app-step-${this.state.step}`}>
          <div className="app-controls">
            <div className="app-action-step-1">
              <h2 className="app-title">Not Recording</h2>
              <div className="app-buttons">
                <button onClick={this.recordHandler} className="app-record-button">Record</button>
              </div>
            </div>
            <div className="app-action-step-2">
              <h3 className="app-subtitle">{this.state.paused ? 'Paused' : 'Recording'}</h3>
              <h2 className="app-title">{this.state.storeArray ? this.state.storeArray.length : 0} Actions</h2>
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
              <h2 className="app-title">{this.state.storeArray ? this.state.storeArray.length : 0} Actions</h2>
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
        </div>

        {this.state.storeArray ? <Commands remove={this.remove} btnClickHndlr={this.buttonClickHandler} commands={this.state.storeArray} /> : ''}
      </div>
    )
  }
}

document.body.appendChild(app);
ReactDOM.render(<Main />, app);


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      toggle();
    }
  }
);

function toggle() {
  if (app.style.display === "none") {
    chrome.storage.sync.set({ toggle: 'block' }, function () {
      console.log("Toggle state saved, block.");
      app.style.display = "block";
      document.body.className += " toggle";
    });
  } else {
    chrome.storage.sync.set({ toggle: 'none' }, function () {
      console.log("Toggle state saved, none.");
      app.style.display = "none";
      document.body.className = document.body.className.replace("toggle", "").trim();
    });
  }
}