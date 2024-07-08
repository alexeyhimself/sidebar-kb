# Personal Knowledge Base side panel
This is an MVP for a Personal Knowledge Base side panel extension for Google Chrome desktop.
![image](https://www.dropbox.com/scl/fi/0j638d53bsaqwos4t4t26/Screenshot-at-Jul-08-05-46-44.png?rlkey=vgajq5mupz726h6jg3yruka9h&raw=1)


## How to install
1. Clone this repository (or download it as a ZIP-archive and unpack)
2. In "kebab" menu of Google Chrome go to: "Extensions" → "Manage Extensions"
3. In the upper right corner enable "Developer mode" if not yet enabled
4. In the upper left corner click "Load unpacked" button and choose repository directory from step 1


## How to use
1. Use "Collect" tab to collect links you want to read / watch / listen / etc. later
2. Use "Queue" tab to filter links with top priority that match you current time frame to learn
3. "Knowledge base" tab is under construction yet, that's why disabled
4. Use "Export links to CSV or JSON" on a "Queue" tab to backup your links at any time


## FAQ
### Where the data is stored?
There's no server behind extension and all the data is stored in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) in you Google Chrome web browser and never leaves it.

### Will the data disappear if I close my browser?
No, the data will stay in your browser.

### Do you collect any personal information using this app?
No.

### Do you use any analytics trackers?
No.
