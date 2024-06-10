const save_link_textareas_ids = ["link", "title", "summary", "time", "tags"];
const range_and_selector_ids = ["importance", "what_to_do"];


function sort_dict_by_value_desc(dict) {  // https://www.geeksforgeeks.org/how-to-sort-a-dictionary-by-value-in-javascript/
  return Object.keys(dict)
    .sort((a, b) => dict[b] - dict[a])
    .reduce((acc, key) => {
      acc[key] = dict[key];
      return acc;
    }, {});
}

function load_tags_from_local_storage() {
  const tags = localStorage.getItem("tags") || "{}";
  return JSON.parse(tags);
}

function update_tags_in_local_storage(new_tags) {
  let tags = load_tags_from_local_storage();
  let existing_tags = tags.existing || {};
  let most_recent_tags = tags.most_recent || [];

  new_tags = new_tags.split(",");
  for (let i in new_tags) {
    const new_tag = new_tags[i].trim();
    // recalculate existing tags stats
    if (new_tag in existing_tags)
      existing_tags[new_tag] += 1;
    else
      existing_tags[new_tag] = 1;

    // if new_tag exists in tags.most_recent then refresh it's position
    var new_tag_index = most_recent_tags.indexOf(new_tag);
    if (new_tag_index > -1)
      most_recent_tags.splice(new_tag_index, 1);

    most_recent_tags.push(new_tag)
    most_recent_tags = most_recent_tags.slice(-100);  // keep the list length fixed
  }

  tags = {"existing": existing_tags, "most_recent": most_recent_tags};
  localStorage.setItem("tags", JSON.stringify(tags));
}

function compose_tags() {
  const tags = load_tags_from_local_storage();
  if (!tags.existing)
    return [];

  const most_used_tags = sort_dict_by_value_desc(tags.existing);
  const most_recent_tags = tags.most_recent.reverse();

  return Object.keys(most_used_tags);

  setTimeout(() => {
    //... suggest content-based tags
  }, 100);
  //console.log(most_used_tags, most_recent_tags);
  /* 
    based on input:
    if domain exists, get most used tags from there
    if keywords in title / summary
  */
}

function suggest_tags() {
  const tags = compose_tags();
  if (tags.length == 0)
    return;

  let suggested_tags = 'Tags hint: ';
  tags.forEach((tag) => {
    suggested_tags += `<a href="#" class="suggested_tag">${tag}</a>, `;
  });
  suggested_tags = suggested_tags.slice(0, -2)
  document.getElementById("suggested_tags").innerHTML = suggested_tags;

  enable_suggested_tags_listeners();
}

function load_links_from_local_storage() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);
  let links_html = '';
  links.forEach((item) => {
    if (!item.title)
      item.title = item.link;
    links_html += `<p><a href="${item.link}" target="_blank">${item.title}</a></p>`;
  });
  document.getElementById("links_area").innerHTML = links_html;// + links_html;
}

function collect_data_from_the_save_link_form() {
  var current_link = {};
  current_link.date_created = Date.now();

  const elements_ids = save_link_textareas_ids.concat(range_and_selector_ids);
  for (let each in elements_ids) {
    const element_id = elements_ids[each];
    current_link[element_id] = document.getElementById(element_id).value.trim();
  }

  //console.log(current_link);
  return current_link;
}

function save_current_link() {
  save_data_to_local_storage(collect_data_from_the_save_link_form());
  clear_save_link_form();
  disable_save_button();
  document.getElementById("suggested_tags").innerHTML = "";
}

function save_data_to_local_storage(what_to_save) {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);

  links.push(what_to_save);
  localStorage.setItem("links", JSON.stringify(links));
  update_tags_in_local_storage(what_to_save.tags);
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

function adjust_textarea_size(element) {  // https://stackoverflow.com/questions/995168/textarea-to-resize-based-on-content-length
  element.style.height = "1px";
  element.style.height = (element.scrollHeight) + "px";
}

function shirk_are_if_necessary(element) {
  //if (save_link_textareas_ids.includes(element.id))
  if (element.id == "summary")
    adjust_textarea_size(element);
}

/* LISTENERS */

function enable_textareas_listeners(elements_ids) {
  for (let i in elements_ids) {
    const element_id = elements_ids[i];

    var element = document.getElementById(element_id);
    element.addEventListener('drop', function (event) {
      //current_link[element_id] = event.dataTransfer.getData('text');
      shirk_are_if_necessary(event.target);
      enable_buttons_on_link_value_only();
      suggest_tags();
    });
    element.addEventListener('keyup', function (event) { // change, paste
      //current_link[element_id] = this.value;
      shirk_are_if_necessary(event.target);
      enable_buttons_on_link_value_only();
      suggest_tags();
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

function enable_suggested_tags_listeners() {
  let elements = document.querySelectorAll(".suggested_tag");
  elements.forEach(function(element) {
    element.addEventListener("click", function(event) {
      let existing_tags = document.getElementById("tags").value;
      if (existing_tags)
        document.getElementById("tags").value = existing_tags + `, ${element.innerText}`;
      else
        document.getElementById("tags").value = element.innerText;
    });
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
