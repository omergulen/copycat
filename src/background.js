chrome.omnibox.onInputChanged.addListener(
  function (text, suggest) {
    suggest([
      { content: "f:", description: "Single Form" },
      { content: "s:", description: "Single Submission" },
      { content: "fs:", description: "Form Submissions" },
      { content: "u:", description: "User" },
      { content: "uf:", description: "User Forms" },
      { content: "us:", description: "User Submissions" }
    ]);
  }
);
chrome.omnibox.onInputEntered.addListener(
  function (text) {
    if (text.indexOf(':')) {
      var content = text.split(':');
      var type = content[0];
      var resource = content[1];
      switch (type) {
        case'f':
          chrome.tabs.update({ url: "https://api.jotform.com/form/" + resource + "?debug=1" });
          break;
        case 's':
          chrome.tabs.update({ url: "https://api.jotform.com/submission/" + resource + "?debug=1" });
          break;
        case 'fs':
          chrome.tabs.update({ url: "https://api.jotform.com/form/" + resource + "/submissions?debug=1" });
          break;
        case 'u':
          chrome.tabs.update({ url: "https://api.jotform.com/user/" + resource + "?debug=1" });
          break;
        case 'uf':
          chrome.tabs.update({ url: "https://api.jotform.com/user/" + resource + "/forms?debug=1" });
          break;
        case 'us':
          chrome.tabs.update({ url: "https://api.jotform./user/" + resource + "?/submissions?debug=1" });
          break;
      }
    } else {
      chrome.tabs.update({ url: "https://api.jotform.com/form/" + text + "/submissions?debug=1" });
    }
  }
);


chrome.browserAction.onClicked.addListener(function () {
  chrome.storage.local.get('active', function (items) {
    if (items.active) {
      chrome.storage.local.set({ active: false }, function () {
        chrome.browserAction.setIcon({ path: "icons/icon19-gray.png" });
      });
    } else {
      chrome.storage.local.set({ active: true }, function () {
        chrome.browserAction.setIcon({ path: "icons/icon19.png" });
      });
    }
    chrome.tabs.reload();
  });
});


chrome.extension.sendMessage({}, response => {
  let readyStateCheckInterval = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      chrome.storage.local.get('active', function (items) {
        if (items.active) {
          chrome.browserAction.setIcon({ path: "icons/icon19.png" });
        } else {
          chrome.browserAction.setIcon({ path: "icons/icon19-gray.png" });
        }
      });
    }
  }, 10);
});