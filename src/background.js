'use strict';

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ recording: true }, function () {
        console.log('The app has installed, recording is true.');
    });
});

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
