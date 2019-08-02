/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import unique from 'unique-selector';

import { keyCommands, captureEvents, selectorOptions, storageKey } from './Constants';
import Generator from './Generator';
import "./content.css";

import Commands from './Commands';


const app = document.createElement('div');
app.id = "my-extension-root";

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.verify = this.verify.bind(this);
    this.prepareToAddStorage = this.prepareToAddStorage.bind(this);
    this.state = {};

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
    chrome.storage.sync.get('toggle', function (res) {
      app.style.display = res.toggle;
      if (res.toggle === 'block') {
        document.body.className += " toggle";
      } else {
        document.body.className = document.body.className.replace("toggle", "").trim();
      }
    });

    let self = this;
    // RECORDING STATE
    chrome.storage.sync.get('recording', function (res) {
      if (res.recording) {
        self.record();
      } else {
        self.stop();
      }
      this.setState({ recording: res.recording });
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
      self.sendMessageToBackground(gen.generatePuppeteerCode(storeArray, initURL), self.state.testName);
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
          data: selection.baseNode.textContent
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
          data: data.linkUrl
        };
        break;
      default:
        return;
    }
    this.addToStorage(newEntry);
  }

  isRecursivelyInId(el, id) {
    if (el.id === id) return true;

    while (el.parentNode) {
      el = el.parentNode;
      if (el.id === id) {
        console.log(el);
        return true;
      }
    }
    console.log(false);
    return false;
  }

  addToStorage = (entry) => {
    let self = this;
    chrome.storage.sync.get(storageKey, function (result) {
      var storeArray = result[storageKey] ? result[storageKey] : {};
      let id = Object.keys(storeArray).length

      let keyCheckObject = storeArray[id - 1];
      if (keyCheckObject) {
        if (keyCheckObject.type === 'click' && entry.type === 'page-change') {
          keyCheckObject.type = 'click-page-change';
          console.log(JSON.stringify(storeArray))
        }
        else if (keyCheckObject.type === 'keydown' && !keyCommands.includes(keyCheckObject.data) &&
          keyCheckObject.selector === entry.selector && !keyCommands.includes(entry.data)) {
          keyCheckObject.data += entry.data;
        }
        else {
          storeArray[id] = entry;
        }
      }
      else {
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
        console.log("Saved a new array item");
      });
    });
  }

  prepareToAddStorage(e) {
    if (!this.isRecursivelyInId(e.target, 'my-extension-root')) {
      let newEntry = {
        type: e.type,
        selector: unique(e.target, selectorOptions),
        data: e.key ? e.key : ''
      };
      this.addToStorage(newEntry);
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

  record() {
    captureEvents.forEach(event => {
      window.addEventListener(event, this.prepareToAddStorage)
    });
    window.onbeforeunload = (e) => {
      let newEntry = {
        type: 'page-change',
        selector: undefined,
        data: undefined
      };
      setTimeout(() => this.addToStorage(newEntry));
      // this.addToStorage(newEntry);
    }
    this.storeRecordingState(true);
  }

  stop() {
    window.onbeforeunload = null;
    captureEvents.forEach(event => {
      window.removeEventListener(event, this.prepareToAddStorage)
    });
    this.storeRecordingState(false);
  }

  storeRecordingState = (recordingState) => {
    chrome.storage.sync.set({ recording: recordingState }, () => {
      this.setState({ recording: recordingState });
      console.log("Recording state saved", recordingState);
    })
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

  buttonClickHandler = (event) => {
    var requestType = event.target.id;
    if (requestType) {
      console.log(requestType);
      this[requestType]()
    }
  }

  handleTestNameChange = (e) => {
    this.setState({testName: e.target.value});
  }

  render() {
    return (
      <div className={'my-extension'}>
        <div className={"buttons"}>
          {this.state.recording ?
            <button className="extensionBtn" id="stop" onClick={this.buttonClickHandler}>PAUSE</button> :
            <button className="extensionBtn" id="record" onClick={this.buttonClickHandler}>RECORD</button>
          }
          <button className="extensionBtn" id="reset" onClick={this.buttonClickHandler}>RESET</button>
          <button className="extensionBtn" id="save" onClick={this.buttonClickHandler}>SAVE</button>
        </div>
        <div className={"buttons"}>
          <input className={"testName"} placeholder="test name.js" type={"text"} value={this.state.testName} onChange={this.handleTestNameChange} />
        </div>
        {this.state.storeArray ? <Commands remove={this.remove} btnClickHndlr={this.buttonClickHandler} commands={this.state.storeArray} /> : ''}
      </div>
    )
  }
}
app.style.display = 'none';
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