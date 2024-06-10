// top level await is available in ES modules loaded from script tags
const [tab] = await chrome.tabs.query({
  active: true,
  lastFocusedWindow: true
});

const tabId = tab.id;
const button = document.getElementById('openSidePanel');
button.addEventListener('click', async () => {
  document.getElementById("welcome").style.display = 'none';
  document.getElementById("pin").style.display = '';
  await chrome.sidePanel.open({ tabId });
  await chrome.sidePanel.setOptions({
    tabId,
    path: 'sidepanel.html',
    enabled: true
  });
});
