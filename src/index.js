import Podo from './app/Podo'

chrome.extension.sendMessage({}, response => {
  let readyStateCheckInterval = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      // Check Podo Active or Not
      chrome.storage.local.get('active', function (items) {
        if (items.active) {
          // PODO!
          new Podo().start();
        }
      });

    }
  }, 10);
});
