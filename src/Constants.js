// Keys which are not characters
export const keyCommands = [
    "Enter",
    "Backspace",
    "Tab",
    "Meta",
    "Escape",
    "Alt",
    "Control",
    "Shift",
    "CapsLock"
];

// Keys which can be combined
export const combinationKeys = [
    "Meta",
    "Alt",
    "Control",
    "Shift"
];

// The events which will be recorded
export const captureEvents = [
    "keydown",
    "mousedown",
    "mouseup"
];

// Unique selector configuration
export const selectorOptions = {
    selectorTypes: [
        "ID",
        "Class",
        "Tag",
        "NthChild"
    ]
};

// Command box colors according to the action
export const eventColors = {
    "mousedown": "#fff0fe",
    "click": "#f0f4ff",
    "drag-and-drop": "#f0feff",
    "keydown": "#f2fff0",
    "combined-keydown": "#fffce4",
    "verify-text": "#ffebe7",
    "verify-link": "#fdeff9",
    "verify-dom": "#f1f1f1",
    "page-change": "rgba(144, 121, 212, 0.15)",
    "click-page-change": "#d7ffdc"
}

// Chrome.storage key
export const storageKey = "commands";