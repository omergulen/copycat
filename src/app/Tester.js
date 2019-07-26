import unique from 'unique-selector';
import Generator from './Generator';
import { keyCommands, captureEvents, selectorOptions } from './Constants';

class Tester {

  constructor() {
    this.verify = this.verify.bind(this);
    this.addListener = this.addListener.bind(this);

    chrome.runtime.onMessage.addListener(
      (request, sender, sendResponse) => {
        if (request.type) {
          if (request.type.slice(0, 6) === 'remove') {
            this.remove(request.type.slice(6))
          } else {
            this[request.type]()
          }
          console.log(request.type)
        } else if (request.verify) {
          this.verify(request.data)
        }
      });
  }

  save() {
    let storagekey = "commands";
    chrome.storage.sync.get([storagekey], function (result) {
      var storeObject = result[storagekey] ? result[storagekey] : [];
      var gen = new Generator();
      console.log(gen.generatePuppeteerCode(storeObject));
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
          data: data.selectionText
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

  addToStorage(entry) {
    let storagekey = "commands";

    chrome.storage.sync.get(storagekey, function (result) {
      var storeObject = result[storagekey] ? result[storagekey] : {};
      let id = Object.keys(storeObject).length

      let keyCheckObject = storeObject[id - 1];
      if (keyCheckObject && keyCheckObject.type === 'keydown' && keyCheckObject.selector === entry.selector && !keyCommands.includes(entry.data)) {
        keyCheckObject.data += entry.data;
      } else {
        storeObject[id] = entry;
      }

      var jsonObj = {};
      jsonObj[storagekey] = storeObject;
      chrome.storage.sync.set(jsonObj, function () {
        console.log("Saved a new array item");
      });
    });
  }

  addListener(e) {
    let newEntry = {
      type: e.type,
      selector: unique(e.target, selectorOptions),
      data: e.key ? e.key : ''
    };
    this.addToStorage(newEntry);
  }

  remove(id) {
    let storagekey = "commands";
    chrome.storage.sync.get(storagekey, function (result) {
      var storeObject = result[storagekey] ? result[storagekey] : {};

      delete storeObject[id];

      var jsonObj = {};
      jsonObj[storagekey] = storeObject;
      chrome.storage.sync.set(jsonObj, function () {
        console.log("Removed item: " + id + " array item");
      });
    });
  }

  record() {
    captureEvents.forEach(event => {
      window.addEventListener(event, this.addListener)
    });
  }

  stop() {
    captureEvents.forEach(event => {
      window.removeEventListener(event, this.addListener)
    });

  }

  reset() {
    let storagekey = "commands";

    var jsonObj = {};
    jsonObj[storagekey] = [];
    chrome.storage.sync.set(jsonObj, function () {
      console.log("Storage has reset!");
    });
  }
}

/**
 * Export Podo
 */
export default Tester;