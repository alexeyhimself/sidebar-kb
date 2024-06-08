const save_link_textareas_ids = ["link", "title", "summary", "time"];
const range_and_selector_ids = ["importance", "what_to_do"];

function load_links_from_local_storage() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);
  let links_html = '';
  links.forEach((item) => {
    if (!item.title)
      item.title = item.link;
    links_html += `<p><a href="${item.link}" target="_blank">${item.title}</a></p>`;
  });
  document.getElementById("links_area").innerHTML = links_html;
}

function collect_data_from_the_save_link_form() {
  var current_link = {};
  current_link.date_created = Date.now();

  const elements_ids = save_link_textareas_ids.concat(range_and_selector_ids);
  for (let each in elements_ids) {
    const element_id = elements_ids[each];
    current_link[element_id] = document.getElementById(element_id).value;
  }

  //console.log(current_link);
  return current_link;
}

function save_current_link() {
  save_data_to_local_storage(collect_data_from_the_save_link_form());
  clear_save_link_form();
  disable_save_button();
}

function save_data_to_local_storage(what_to_save) {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);

  links.push(what_to_save);
  localStorage.setItem("links", JSON.stringify(links));
}
function clear_save_link_form() {
  save_link_textareas_ids.forEach((id) => {
    document.getElementById(id).value = "";
  });
}

function enable_save_button() {
  document.getElementById("save").classList.remove("disabled");
}
function disable_save_button() {
  document.getElementById("save").classList.add("disabled");
}
function enable_buttons_on_link_value_only() {
  setTimeout(() => {
    if(document.getElementById("link").value)
      enable_save_button();
    else
      disable_save_button();
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
}

function dim_range_placeholder_in_thumb_proximity(importance) {
  if (!importance)  // initial start of the event listener
    importance = document.getElementById("importance").value;

  const importance_placeholder_element = document.getElementById("importance_placeholder");
  if (importance < 38)  // 38 is the length of "Set importance" placeholder
    importance_placeholder_element.style.color = '#585c5f70';
  else
    importance_placeholder_element.style.color = '#585c5fff';
}


/* LISTENERS */

function enable_textareas_listeners(elements_ids) {
  for (let i in elements_ids) {
    const element_id = elements_ids[i];

    var element = document.getElementById(element_id);
    element.addEventListener('drop', function (event) {
      //current_link[element_id] = event.dataTransfer.getData('text');
      enable_buttons_on_link_value_only();
    });
    element.addEventListener('keyup', function (event) { // change, paste
      //current_link[element_id] = this.value;
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
  dim_range_placeholder_in_thumb_proximity();

  var element = document.getElementById(element_id);
  element.addEventListener('change', function (event) {
    const importance = parseInt(this.value);
    dim_range_placeholder_in_thumb_proximity(importance);
  });
}

/*
function enable_radios_listener(radio_name) {
  document.querySelectorAll(`input[name='${radio_name}']`).forEach((input) => {
    input.addEventListener('change', function (event) {
      current_link.what_to_do = event.target.id;
    });
  });
}
function enable_selector_listener(element_id) {
  var element = document.getElementById(element_id);  
  element.addEventListener('change', function (event) {
    current_link.what_to_do = event.target.value;
  });
}
*/    

window.onload = function() {
  load_links_from_local_storage();
  enable_textareas_listeners(save_link_textareas_ids);
  enable_buttons_listeners({
    "save": save_current_link, 
    "find-tab": load_links_from_local_storage
  });
  enable_range_listener("importance");
}
