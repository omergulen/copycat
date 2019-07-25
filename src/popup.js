let storagekey = "commands";
chrome.storage.sync.get([storagekey], function (result) {
    var storeObject = result[storagekey] ? result[storagekey] : {};
    for (key in storeObject) {
        element = storeObject[key];
        id = { key };
        if (element) {
            var node = document.createElement("LI");
            let data = element.data ? ` | "${element.data}"` : '';
            var textnode = document.createTextNode(`${element.type} | ${element.selector}${data}`);

            var xButton = document.createElement("BUTTON");
            xButton.innerHTML = "X";

            xButton.setAttribute("id", "remove" + id.key);
            node.setAttribute("id", "command" + id.key);

            xButton.addEventListener("click", function omer(e) {
                sendMessageToTester(e);
                const buttonIns = e.currentTarget;
                buttonIns.parentElement.remove();
            });

            node.appendChild(textnode);
            node.appendChild(xButton);
            document.getElementById("commands").appendChild(node);
        }
    }
});

var recordButton = document.getElementById("record");
var stopButton = document.getElementById("stop");
var resetButton = document.getElementById("reset");
var saveButton = document.getElementById("save");

var sendMessageToTester = (e) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: e.target.id }, function () { });
    });
}

recordButton.addEventListener("click", sendMessageToTester)

stopButton.addEventListener("click", sendMessageToTester)

resetButton.addEventListener("click", (e) => {
    sendMessageToTester(e)
    var commands = document.getElementById("commands");
    while (commands.firstChild) {
        commands.removeChild(commands.firstChild);
    }
})

saveButton.addEventListener("click", sendMessageToTester)