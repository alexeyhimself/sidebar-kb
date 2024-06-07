const default_current_link = {"urgency": 50};
var current_link = default_current_link;

function load_links_from_local_storage() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);
  let links_html = '';
  links.forEach((item) => {
    if (!item.title)
      item.title = item.link;
    links_html += `<p><a href="${item.link}" target="_blank">${item.title}</a></p>`;
  });
  document.getElementById('links_area').innerHTML = links_html;
}

function save_to_local_storage() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);
  links.push(current_link);
  localStorage.setItem("links", JSON.stringify(links));

  clear_form();
  disable_buttons();
}
function clear_form() {
  current_link = default_current_link;
  location.reload();
}

function enable_buttons() {
  document.getElementById("save").classList.remove("disabled");
}
function disable_buttons() {
  document.getElementById("save").classList.add("disabled");
}
function enable_buttons_on_link_value_only() {
  setTimeout(() => {
    if(document.getElementById("link").value)
      enable_buttons();
    else
      disable_buttons();
  }, 100); // a bit wait because drag&drop events pass faster than the DOM update
}

function enable_textareas_listeners(elements_ids) {
  for (let i in elements_ids) {
    const element_id = elements_ids[i];

    var element = document.getElementById(element_id);
    element.addEventListener('drop', function (event) {
      current_link[element_id] = event.dataTransfer.getData('text');
      enable_buttons_on_link_value_only();
    });
    element.addEventListener('keyup', function (event) { // change, paste
      current_link[element_id] = this.value;
      enable_buttons_on_link_value_only();
    });
  }
}

function enable_buttons_listeners(buttons) {
  for (let button_id in buttons) { 
    var element = document.getElementById(button_id);
    element.addEventListener('click', function (event) {
      buttons[button_id]();
    });
  }
}

function enable_range_listener(element_id) {
  var element = document.getElementById(element_id);
  element.addEventListener('change', function (event) {
    current_link[element_id] = parseInt(this.value);
  });
}

window.onload = function() {
  load_links_from_local_storage();
  enable_textareas_listeners(["link", "title", "summary"]);
  enable_buttons_listeners({
    "save": save_to_local_storage, 
    "find-tab": load_links_from_local_storage
  });
  enable_range_listener("urgency");
}


// "read", "watch", "listen", "reply", "buy", "review", "attend", "connect", 
// 