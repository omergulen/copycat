import unique from 'unique-selector';

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

    chrome.runtime.onMessage.addListener(
      (request, sender, sendResponse) => {
        if (request.type) {
            console.log(request.type)
            this[request.type]()
        }
      });
  }

  addListener(e) {
    let storagekey = "commands";
    let newArrEntry = e.type + " " + unique(e.target, this.options);
    chrome.storage.sync.get([storagekey], function (result) {
      var array = result[storagekey] ? result[storagekey] : [];

      array.unshift(newArrEntry);

      var jsonObj = {};
      jsonObj[storagekey] = array;
      chrome.storage.sync.set(jsonObj, function () {
        console.log("Saved a new array item");
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