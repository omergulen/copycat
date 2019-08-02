'use strict';
// Called when the user clicks on the browser action
chrome.browserAction.onClicked.addListener(function (tab) {
   // Send a message to the active tab
   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { "message": "clicked_browser_action" });
   });
});


chrome.runtime.onInstalled.addListener(function () {
   console.log('The extension has installed.');
});

chrome.runtime.onMessage.addListener(
   (request, sender, sendResponse) => {
      if (request.downloadContent && request.testName) {
         let docContent = request.downloadContent;
         let doc = URL.createObjectURL(new Blob([docContent], { type: 'application/octet-binary' }));
         chrome.downloads.download({ url: doc, filename: request.testName, conflictAction: 'overwrite', saveAs: true });
         sendResponse({text:'Download started!'});
      }
   }
);

var sendMessageToTester = (contextData) => {
   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { verify: true, data: contextData }, function () { });
   });
}

chrome.contextMenus.onClicked.addListener(sendMessageToTester);

chrome.contextMenus.create({
   "title": "Test Extension",
   "id": "parent",
   "contexts": ["all", "link"]
});

chrome.contextMenus.create({
   "id": "verify-text",
   "parentId": "parent",
   "title": "Verify Text",
   "contexts": ["selection"]
});

chrome.contextMenus.create({
   "id": "verify-link",
   "parentId": "parent",
   "title": "Verify Link",
   "contexts": ["link"]
});

chrome.contextMenus.create({
   "id": "verify-dom",
   "parentId": "parent",
   "title": "Verify DOM Element",
   "contexts": ["all"]
});
