# Testing Extension
## (for jest-puppeteer)
This extension is built to ease creating web tests. It is like Selenium-IDE, but for jest-puppeteer (for now).

Also, this extension records actions on your own browser, so it doesn't need to open new Selenium or Puppeteer window to record your actions on it.

In recording state it records the events which are stated below with the target elements unique selector.

### Supported Actions

#### Click origined events
| Action Key    | Description   |
| --------------------- | ------------- |
| `click`       | Mouse `click` event. |
| `mousedown`       | Mouse `mousedown` event. |
| `drag-and-drop` | If `mouseup` event comes after `mousedown` event and the difference between their coordinates is greater than 10. |

#### Key originated events
| Action Key    | Description   |
| --------------------- | ------------- |
| `keydown`       | Keyboard `keydown` event. It automaticly gathers the `keydown` events into one if they consecutive triggered and their selectors are the same. |
| `combined-keydown`       | It combines special keydown events if they are trigged at the same time, example: `Ctrl+A`. |

#### Page change events
| Action Key    | Description   |
| --------------------- | ------------- |
| `page-change`       | If `onbeforeunload` event is triggered. |
| `click-page-change` | If `onbeforeunload` event of the window comes after `click` or `mousedown` event. |

#### Verify events
Triggers with right click on the element and choose proper verify action.
| Action Key    | Description   |
| --------------------- | ------------- |
| `verify-text`       | It gets the right clicked element's `text` and matches with the `textContent` of the element in the test. |
| `verify-link`       | It gets the right clicked element's `href` and matches with the `href` of the element in the test. |
| `verify-DOM`       | It gets the right clicked element and check if it exists in the test. |

## Installation

```
git clone https://github.com/omergulen/testing-extension.git
```
Go to `testing-extension` directory run

```
yarn install
```
Now build the extension using
```
yarn build
```
You will see a `build` folder generated inside `[PROJECT_HOME]`

## Adding Testing Extension to Chrome

In Chrome browser, go to `chrome://extensions` page and switch on developer mode. This enables the ability to locally install a Chrome extension.

<img src="https://cdn-images-1.medium.com/max/1600/1*OaygCwLSwLakyTqCADbmDw.png" />

Now click on the `LOAD UNPACKED` and browse to `[PROJECT_HOME]\build` ,This will install the React app as a Chrome extension.

When you go to any website and click on extension icon, injected page will toggle.

<img src="https://cdn-images-1.medium.com/max/1600/1*bXJYfvrcHDWKwUZCrPI-8w.png" />

