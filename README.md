# Personal Knowledge Base side panel
This is an MVP for a Personal Knowledge Base side panel extension for Google Chrome desktop.
![image 1](https://www.dropbox.com/scl/fi/jgrdvfnfme3rho63qezsy/Screenshot-at-Jul-23-12-43-46.png?rlkey=1kcy5lcy67x8qnmryk7inq28e&raw=1)
![image 2](https://www.dropbox.com/scl/fi/l4z30ff2zeejpc0or5r4b/Screenshot-at-Jul-23-12-44-46.png?rlkey=gkbk1ovz0unjav1f2aadi4743&raw=1)


## How to get source code
* Choose [Get source code using ZIP-archive](#get-source-code-using-zip-archive) way if (1) you're not familiar with git and (2) you don't plan to get any updates of the app in the nearest future.
* Choose [Get source code using GitHub Desktop](#get-source-code-using-github-desktop) option if you plan to get updates of the app often.

### Get source code using ZIP-archive
1. Download this repository as a ZIP-archive and unpack it

### Get source code using GitHub Desktop
1. Go to https://desktop.github.com and download GitHub Desktop app for your platform
2. Install and run GitHub Desktop app
3. In the upper left corner of GitHub Desktop app click on "Current repository" → "Add" → "Clone Repository"
4. Paste this URL https://github.com/alexeyhimself/sidebar-kb.git into the input field in GitHub Desktop app
5. At the bottom choose the path where you want to save it on your computer
6. Hit "Clone" button


## How to install
1. [Get the source code](#how-to-get-source-code) onto your computer
2. In "kebab" menu of Google Chrome go to: "Extensions" → "Manage Extensions"
3. In the upper right corner enable "Developer mode" if not yet enabled
4. In the upper left corner click "Load unpacked" button and choose repository directory from step 1


## How to get the updates
### If you used ZIP-archive option during installation
1. Go to this repository page
2. Repeat all the steps for ZIP-archive option in [How to install](#how-to-install) section 
3. Close and open side panel extension in your browser

### If you used GitHub Desktop option during installation
1. Open GitHub Desktop app
2. Hit "Fetch" and/or "Pull origin" button in the top-right corner;
3. Close and open side panel extension in your browser


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
