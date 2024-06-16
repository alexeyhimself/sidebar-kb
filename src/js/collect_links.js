const save_link_textareas_ids = ["link", "title", "summary", "time", "tags"];
const range_and_selector_ids = ["priority", "what_to_do"];


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
    const new_tag = new_tags[i].trim().replace(/(?:\r\n|\r|\n)/g, '');
    if (!new_tag)
      continue;

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

  const most_recent_tags = tags.most_recent.reverse();

  return most_recent_tags.slice(0, 30);

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

  let most_used_tags = sort_dict_by_value_desc(load_tags_from_local_storage().existing);
  most_used_tags = Object.keys(most_used_tags).slice(0, 15);

  let tags_hint = 'Tags hint: ';
  tags.forEach((tag) => {
    if (most_used_tags.includes(tag))
      tags_hint += `<a href="#" class="suggested_tag"><b>${tag}</b></a>, `;
    else
      tags_hint += `<a href="#" class="suggested_tag">${tag}</a>, `;
  });
  tags_hint = tags_hint.slice(0, -2)
  document.getElementById("tags_hint").innerHTML = tags_hint;

  enable_tags_hint_listeners();
}

function collect_data_from_the_save_link_form() {
  var current_link = {};
  current_link.date_created = Date.now();

  const elements_ids = save_link_textareas_ids.concat(range_and_selector_ids);
  for (let each in elements_ids) {
    const element_id = elements_ids[each];
    current_link[element_id] = document.getElementById(element_id).value.trim();
  }

  return current_link;
}

function reset_collect_links_form_state() {
  clear_save_link_form();
  disable_save_button();
  draw_links_stats_chart_under_priority_bar("chart_total");
  draw_links_stats_chart_under_priority_bar("chart_what_to_do");
  save_link_textareas_ids.forEach((id) => {
    adjust_textarea_size(document.getElementById(id));
  });
}

function save_current_link() {
  save_data_to_local_storage(collect_data_from_the_save_link_form());
  reset_collect_links_form_state();
}

function save_data_to_local_storage(what_to_save) {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);

  links.push(what_to_save);
  localStorage.setItem("links", JSON.stringify(links));
  update_tags_in_local_storage(what_to_save.tags);
}
function clear_save_link_form() {
  document.getElementById("tags_hint").innerHTML = "";

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

function enable_tags_hint_on_any_value_only() {
  setTimeout(() => {
    if(document.getElementById("link").value || document.getElementById("title").value || document.getElementById("summary").value || document.getElementById("tags").value)
      document.getElementById("tags_hint").style.display = '';
    else
      document.getElementById("tags_hint").style.display = 'none';
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
}

function dim_range_placeholder_in_thumb_proximity(priority) {
  if (!priority)  // initial start of the event listener
    priority = document.getElementById("priority").value;

  const priority_placeholder_element = document.getElementById("priority_placeholder");
  if (priority < 26)  // the length of "Set priority" placeholder
    priority_placeholder_element.style.color = '#585c5f70';
  else
    priority_placeholder_element.style.color = '#585c5fff';
}

function adjust_textarea_size(element) {  // https://stackoverflow.com/questions/995168/textarea-to-resize-based-on-content-length
  element.style.height = "1px";
  element.style.height = (element.scrollHeight) + "px";
}

function shirk_textareas_if_necessary(element) {
  console.log(1)
  if (["link", "title", "summary"].includes(element.id))
    adjust_textarea_size(element);
}

function hide_fields_if_necessary(element) {
  if (element.value == "tool" || element.value == "course") {
    document.getElementById("priority").style.display = 'none';
    document.getElementById("priority_placeholder").style.display = 'none';
    document.getElementById("chart_total").style.display = 'none';
    document.getElementById("chart_what_to_do").style.display = 'none';
    document.getElementById("time").style.display = 'none';
    document.getElementById("what_to_do").classList.add("all-around-border-radius");
    document.getElementById("tags").focus();
  }
  else {
    document.getElementById("priority").style.display = '';
    document.getElementById("priority_placeholder").style.display = '';
    document.getElementById("chart_total").style.display = '';
    document.getElementById("chart_what_to_do").style.display = '';
    document.getElementById("time").style.display = '';
    document.getElementById("what_to_do").classList.remove("all-around-border-radius");
    document.getElementById("time").focus();
  }
}

function what_to_do_on_textareas_content_change(event) {
  shirk_textareas_if_necessary(event.target);
  enable_buttons_on_link_value_only();
  enable_tags_hint_on_any_value_only();
  suggest_tags();
}

/* LISTENERS */

function enable_textareas_listeners(elements_ids) {
  for (let i in elements_ids) {
    const element_id = elements_ids[i];

    var element = document.getElementById(element_id);
    element.addEventListener('drop', function (event) {
      //current_link[element_id] = event.dataTransfer.getData('text');
      what_to_do_on_textareas_content_change(event);
    });
    element.addEventListener('keyup', function (event) { // change, paste
      //current_link[element_id] = this.value;
      what_to_do_on_textareas_content_change(event);
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
    const priority = parseInt(this.value);
    dim_range_placeholder_in_thumb_proximity(priority);
  });
}

function enable_tags_hint_listeners() {
  let elements = document.querySelectorAll(".suggested_tag");
  elements.forEach(function(element) {
    element.addEventListener("click", function(event) {
      let tags_element = document.getElementById("tags");
      let existing_tags = tags_element.value.trim();

      if (!existing_tags)
        tags_element.value = element.innerText;
      else if (existing_tags.slice(-1) == ',')
        tags_element.value = existing_tags + ` ${element.innerText}`;
      else
        tags_element.value = existing_tags + `, ${element.innerText}`;
    });
  });
}

function enable_selector_listener(element_id) {
  var element = document.getElementById(element_id);  
  element.addEventListener('change', function (event) {
    hide_fields_if_necessary(event.target);
    draw_links_stats_chart_under_priority_bar("chart_what_to_do", event.target.value);
  });
}

function enable_side_panel_dblclick_listener() {
  var element = document.getElementById("link");
  element.addEventListener('dblclick', function (event) {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      const tab = tabs[0];
      document.getElementById("link").value = tab.url;
      document.getElementById("title").value = tab.title;
    });
  });
}


var chart_total_max = 0;
var chart_what_to_do_max = 0;

function calculate_links_stats_for_priority_bar(chart_id, what_to_do) {
  let links = load_links_from_local_storage();
  let stats = {};
  let max = 0;
  for (let i in links) {
    let link = links[i];
    if (!link.priority)
      continue;

    if (what_to_do && chart_id == "chart_what_to_do") {
      if (link.what_to_do != what_to_do)
        continue;
    }

    if (!stats[link.priority])
      stats[link.priority] = 1;
    else
      stats[link.priority] += 1;

    if (stats[link.priority] > max)
      max = stats[link.priority];
  }
  
  if (chart_id == "chart_what_to_do")
    chart_what_to_do_max = max;
  else
    chart_total_max = max;

  return stats;
}
function draw_links_stats_chart_under_priority_bar(chart_id, what_to_do) {
  if (!what_to_do)
    what_to_do = document.getElementById("what_to_do").value;

  const stats = calculate_links_stats_for_priority_bar(chart_id, what_to_do);
  const max = chart_total_max;

  let content = '';
  for (let i = 0; i <= 100; i+=2) {
    let items = stats[i];
    let items2 = stats[i+1];
    let items3 = items || 0;
    if (items2)
      items3 += items2;

    if (items3)
      content += `<div style="height: ${items3 * 100 / (max * 1.5)}%;" class="${chart_id}"></div>`;
    else
      content += `<div style="height: 1px;" class="${chart_id}"></div>`;
  }
  document.getElementById(chart_id).innerHTML = content;
}

function enable_collect_links_listeners() {
  enable_textareas_listeners(save_link_textareas_ids);
  enable_buttons_listeners({
    "save": save_current_link
  });
  enable_range_listener("priority");
  enable_selector_listener("what_to_do");
  enable_side_panel_dblclick_listener();
}

function enable_collect_links() {
  enable_collect_links_listeners();
  draw_links_stats_chart_under_priority_bar("chart_total");
  draw_links_stats_chart_under_priority_bar("chart_what_to_do");
}
