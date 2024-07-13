const collect_links_textareas_ids = ["link", "title", "notes", "time", "tags"];
const all_input_elements_ids = collect_links_textareas_ids.concat(["priority", "what_to_do"]);

function show_collect_welcome() {
  document.getElementById("form").style.display = 'none';
  document.getElementById("welcome").style.display = 'block';
}
function show_collect_form() {
  document.getElementById("welcome").style.display = 'none';
  document.getElementById("form").style.display = 'block';
}

function bring_form_to_idle_state() {
  document.getElementById("save").classList.add("disabled");
  document.getElementById("priority").style.setProperty('--sliderColor', "#6ba2ff");
  document.getElementById("what_to_do").style.color = "gray";
  document.getElementById("clear").style.display = "none";
  //document.querySelectorAll(".priority_placeholder").forEach((element) => {
  //  element.style.top = "-107px";
  //});
}
function bring_form_to_active_state() {
  document.getElementById("save").classList.remove("disabled");
  document.getElementById("priority").style.setProperty('--sliderColor', "#0075ff");
  document.getElementById("what_to_do").style.color = "black";
  document.getElementById("clear").style.display = "";
  //document.querySelectorAll(".priority_placeholder").forEach((element) => {
  //  element.style.top = "-107px";
  //});
}

function collect_data_from_the_save_link_form() {
  let current_link = {};
  current_link.date_created = Date.now();

  for (let i in all_input_elements_ids) {
    const element_id = all_input_elements_ids[i];
    current_link[element_id] = document.getElementById(element_id).value.trim().replace(/(?:\r\n|\r|\n|\t)/g, '').trim();
  }
  return current_link;
}

function clear_save_link_form() {
  collect_links_textareas_ids.forEach((id) => {
    document.getElementById(id).value = "";
    adjust_textarea_size(document.getElementById(id));
  });
}

/*
function dim_range_placeholder_in_thumb_proximity(priority) {
  if (!priority)  // initial start of the event listener
    priority = document.getElementById("priority").value;

  if (priority < 63)  // the length of "Set priority" placeholder
    document.getElementById("priority_placeholder").style.color = '#585c5f70';
  else
    document.getElementById("priority_placeholder").style.color = '#585c5fff';
}
*/

async function count_tabs_in_a_window() {
  const tabs = await chrome.tabs.query({currentWindow: true, groupId: -1, pinned: false});
  let result = tabs.length;
  if (tabs.length > 1)
    result = "all " + result;
  document.getElementById("number_of_tabs").innerHTML = result;
}

async function save_all_tabs_in_window() {
  const tabs = await chrome.tabs.query({currentWindow: true, groupId: -1, pinned: false});  // do not touch pinned and grouped tabs
  const saved_tabs_group_id = Date.now();  // to find this collapse transaction in future
  tabs.forEach((tab) => {
    if (tab.url) {  // do not save empty tabs
      let link = {"group_id": saved_tabs_group_id, "what_to_do": "undefined", "feature": "save_all_tabs_in_window"};
      link.link = tab.url.trim().replace(/(?:\r\n|\r|\n|\t)/g, '').trim();
      link.title = tab.title.trim().replace(/(?:\r\n|\r|\n|\t)/g, '').trim();
      link.date_created = Date.now();

      if (!link_already_exists(link.link))  // do not save duplicates
        save_link_into_queue(link);
    }
    chrome.tabs.remove(tab.id, function() {});  // close all (even empty) but not pinned and grouped
  });
}

function hide_fields_if_necessary(element) {
  let display;
  if (["tool", "course"].includes(element.value)) {
    display = 'none';
    document.getElementById("what_to_do").classList.add("all-around-border-radius");
    document.getElementById("tags").focus();
  }
  else {
    display = '';
    document.getElementById("what_to_do").classList.remove("all-around-border-radius");
    // document.getElementById("time").focus();  // when try to edit URL this breaks UX
  }

  document.getElementById("priority").style.display = display;
  //document.getElementById("priority_placeholder").style.display = display;
  //document.getElementById("chart_total").style.display = display;
  //document.getElementById("chart_what_to_do").style.display = display;
  document.getElementById("time").style.display = display;
}

function link_already_exists(link) {
  const links = load_links_from_local_storage();
  for (let i = 0; i < links.length; i++) {
    if (links[i].link == link)
      return links[i];
  }
  return false;
}

function fill_the_collect_links_form_with_existing_data(link) {
  all_input_elements_ids.forEach((element_id) => {
    document.getElementById(element_id).value = link[element_id];
  });
}

function adjust_if_link_already_exists(link) {
  const existing_link = link_already_exists(link);
  if (existing_link) {
    fill_the_collect_links_form_with_existing_data(existing_link);
    document.getElementById("save").innerText = "Update existing item";
    document.getElementById("save").classList.add("btn-warning");
  }
  else {
    document.getElementById("save").innerText = "Save to Queue";
    document.getElementById("save").classList.remove("btn-warning");
  }
}

function what_to_do_on_textareas_content_change(event) {
  adjust_textarea_size(event.target);
  enable_button_on_link_value_only();
  enable_tags_hint_on_any_value_only();

  if (!document.getElementById("save").classList.contains("context_menu_call"))
    suggest_tags();

  if (event.target.id == "link") {
    setTimeout(() => {
      const link = event.target.value;
      adjust_if_link_already_exists(link);
      suggest_what_to_do(link);

    }, 200);  // a bit wait because drag&drop events pass faster than the DOM update
  }
}

function enable_collect_links() {
  enable_collect_links_listeners();
  //draw_links_stats_chart_under_priority_bar("chart_total");
  //draw_links_stats_chart_under_priority_bar("chart_what_to_do");
  fill_stats_of_what_to_do_for_links();
  count_tabs_in_a_window();
}
