let storagekey = "commands";
chrome.storage.sync.get([storagekey], function (result) {
    var array = result[storagekey] ? result[storagekey] : [];
    array.forEach(element => {
        console.log(element)
        var node = document.createElement("LI");                 // Create a <li> node
        var textnode = document.createTextNode(element);         // Create a text node
        node.appendChild(textnode);                              // Append the text to <li>
        document.getElementById("commands").appendChild(node);
    });
});

var recordButton = document.getElementById("record");
var stopButton = document.getElementById("stop");
var resetButton = document.getElementById("reset");

var sendMessageToTester = (e) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: e.target.id }, function () { });
    });
}

recordButton.addEventListener("click", sendMessageToTester)

stopButton.addEventListener("click", sendMessageToTester)

resetButton.addEventListener("click", sendMessageToTester)