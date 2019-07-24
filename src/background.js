'use strict';

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ recording: true }, function () {
        console.log('The app has installed, recording is true.');
    });
});

