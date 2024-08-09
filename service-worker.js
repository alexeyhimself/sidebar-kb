// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openSidePanel_already_opened_tab',
    title: 'Save this tab',
    contexts: ['all']
  });
  chrome.contextMenus.create({
    id: 'openSidePanel',
    title: 'Save this hyperlink',
    contexts: ['all']
  });
  chrome.tabs.create({ url: 'page.html' });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel_already_opened_tab') {
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({ windowId: tab.windowId }).then(() => {
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: "context_menu_already_opened_tab", "link": info.linkUrl, "title": info.selectionText});
      }, 300);  // a bit wait because drag&drop events pass faster than the DOM update
    });
  }
  else if (info.menuItemId === 'openSidePanel') {
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({ windowId: tab.windowId }).then(() => {
      setTimeout(() => {
        chrome.tabs.create({ url: info.linkUrl });
        chrome.runtime.sendMessage({ type: "context_menu_call", "link": info.linkUrl, "title": info.selectionText});
      }, 300);  // a bit wait because drag&drop events pass faster than the DOM update
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  // The callback for runtime.onMessage must return falsy if we're not sending a response
  (async () => {
    if (message.type === 'open_side_panel') {
      // This will open a tab-specific side panel only on the current tab.
      await chrome.sidePanel.open({ tabId: sender.tab.id });
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'sidepanel.html',
        enabled: true
      });
    }
  })();
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
