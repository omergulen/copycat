import unique from 'unique-selector';
import Generator from './Generator';

class Tester {
  /**
   * Constructor
   */
  constructor() {
    this.events = ['click', 'keydown'];
    this.options = {
      // Array of selector types based on which the unique selector will generate
      selectorTypes: ['ID', 'Class', 'Tag', 'NthChild']
    }
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
          selector: unique(node, this.options),
          data: data.selectionText
        };
        break;
      case "verify-dom":
        newEntry = {
          type: data.menuItemId,
          selector: unique(node, this.options),
          data: ""
        };
        break;
      case "verify-link":
        newEntry = {
          type: data.menuItemId,
          selector: unique(node, this.options),
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
      if (keyCheckObject && keyCheckObject.type === 'keydown' && keyCheckObject.selector === entry.selector  && entry.data !== "Enter") {
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
      selector: unique(e.target, this.options),
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
    this.events.forEach(event => {
      window.addEventListener(event, this.addListener)
    });
  }

  stop() {
    this.events.forEach(event => {
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