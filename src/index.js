import Tester from './app/Tester'

chrome.extension.sendMessage({}, response => {
  let readyStateCheckInterval = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      // Check Podo Active or Not
      new Tester();

    }
  }, 10);
});
