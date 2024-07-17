/*
const button = new DOMParser().parseFromString(
  '<button>Click to open side panel</button>',
  'text/html'
).body.firstElementChild;
button.addEventListener('click', function () {
  chrome.runtime.sendMessage({ type: 'open_side_panel' });
});
document.body.append(button);
*/

const style = "padding-top: 22px; font-weight: bold; border: 1px solid black; z-index: 100500; position: fixed; width: 110px; height: 110px; background: yellow; border-radius: 50%; top: 10px; right: 10px; color: black; text-align: center; font-size: 14px;";
const html = `<div style="${style}">Exists in<br> a Knowledge Base</div>`;
const element = new DOMParser().parseFromString(html, 'text/html').body.firstElementChild;
document.body.append(element);