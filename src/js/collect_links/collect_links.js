const collect_links_textareas_ids = ["link", "title", "notes", "time", "tags"];
const all_input_elements_ids = collect_links_textareas_ids.concat(["priority", "what_to_do"]);

/*
function show_collect_welcome() {
  document.getElementById("form").style.display = 'none';
  document.getElementById("welcome").style.display = 'block';
}
*/
function close_collect_form() {
  //show_collect_welcome();
  const save_element = document.getElementById("save");
  let callback = save_element.dataset.callback;
  if (callback == "queue") {
    what_to_do_on_filter_change();
    delete save_element.dataset.callback;
  }
  save_element.classList.remove("context_menu_call");
  document.querySelectorAll('.modal-backdrop').forEach((e) => {
    e.remove();
  }); // bug https://github.com/twbs/bootstrap/issues/16320
}

/*
function switch_to_save_form() {
  document.getElementById("saved_list").style.display = 'none';
  document.getElementById("save_form").style.display = 'block';
  document.getElementById("switch_to_saved").classList.remove("btn-success");
  document.getElementById("choose_action").classList.add("btn-primary");
}
*/
function enable_url_input_field() {
  document.getElementById("link").removeAttribute("disabled")
}
function disable_url_input_field() {
  document.getElementById("link").setAttribute("disabled", "")
}

function open_empty_collect_form() {
  reset_form_state();
  open_collect_form();
}

function reset_form_state() {
  bring_form_to_idle_state();
  clear_save_link_form();
  enable_tags_hint_on_any_value_only();
  hide_move_and_delete_buttons();
  show_move_button();
  enable_url_input_field();

  document.getElementById("save").innerText = "Save";
  document.getElementById("save").classList.remove("btn-success");
  delete document.getElementById("save").dataset.source;
  document.getElementById("tags_hint").style.display = "none";
}

function open_collect_form() {
  var myModal = new bootstrap.Modal(document.getElementById("exampleModal"), {});
  myModal.show();
}

function bring_form_to_idle_state() {
  document.getElementById("save").classList.add("disabled");
  document.getElementById("priority").style.color = "gray";
  document.getElementById("what_to_do").style.color = "gray";
}
function bring_form_to_active_state() {
  document.getElementById("save").classList.remove("disabled");
  document.getElementById("priority").style.color = "unset";
  document.getElementById("what_to_do").style.color = "unset";
}

function collect_data_from_the_save_link_form() {
  let current_link = {};
  //current_link.date_created = Date.now();

  for (let i in all_input_elements_ids) {
    const element_id = all_input_elements_ids[i];
    let value = document.getElementById(element_id).value.trim();
    if (element_id != "notes")
      value = value.replace(/(?:\r\n|\r|\n|\t)/g, '').trim();
    if (element_id == "priority")
      value = parseInt(value);
    current_link[element_id] = value;
  }
  current_link["source"] = document.getElementById("save").dataset.source;
  return current_link;
}

function shirk_textareas_to_content() {
  sleep(200).then(() => {
    collect_links_textareas_ids.forEach((id) => {
      adjust_textarea_size(document.getElementById(id));
    });
  });
}

function clear_save_link_form() {
  collect_links_textareas_ids.forEach((id) => {
    document.getElementById(id).value = "";
    //adjust_textarea_size(document.getElementById(id));
  });
  document.getElementById("what_to_do").value = "";
  document.getElementById("priority").value = "";
  shirk_textareas_to_content();
}

async function count_tabs_in_a_window() {
  return;

  const tabs = await chrome.tabs.query({currentWindow: true, groupId: -1, pinned: false});
  let result = tabs.length;
  if (tabs.length > 1)
    result = "all " + result;
  document.getElementById("number_of_tabs").innerHTML = result;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function save_selected_tabs(tabs) {
  document.getElementById('time-based').checked = true; // show how saved on time-based
  const saved_tabs_group_id = Date.now();  // to find this collapse transaction in future
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const hostname = get_hostname(tab.url);

    if (tab.url) {  // do not save empty tabs
      let link = {"group_id": saved_tabs_group_id, "what_to_do": undefined, "feature": "save_all_tabs_in_window"};
      link.link = tab.url.trim().replace(/(?:\r\n|\r|\n|\t)/g, '').trim();
      link.title = tab.title.trim().replace(/(?:\r\n|\r|\n|\t)/g, '').trim();
      //link.date_created = Date.now();

      save(link);
    }
    if (!["meet.google.com"].includes(hostname))
      chrome.tabs.remove(tab.id, function() {});  // close all (even empty) but not pinned and grouped

    await sleep(150 + 200 / (i + 1));  // acceleration from 300 to 150
    //await sleep(300);
  }
}

async function save_all_selected_tabs_in_window() {
  const tabs = await chrome.tabs.query({currentWindow: true, groupId: -1, pinned: false, highlighted: true});  // do not touch pinned and grouped tabs
  await save_selected_tabs(tabs);
  show_toast("Selected tabs have been saved");
}

async function save_all_tabs_in_window() {
  const tabs = await chrome.tabs.query({currentWindow: true, groupId: -1, pinned: false});  // do not touch pinned and grouped tabs
  chrome.tabs.create({});  // create an empty tab that will stay at the end. It has to go first in order to keep the browser opened if no tabs will remain
  await save_selected_tabs(tabs);
  show_toast("All tabs have been saved to Queue");
}

function hide_fields_if_necessary(element) {
  let display;
  if (no_time_what_to_do.includes(element.value)) {
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
  document.querySelectorAll(".priority_placeholder").forEach((element) => {
    element.style.display = display;
  });
  //document.getElementById("chart_total").style.display = display;
  //document.getElementById("chart_what_to_do").style.display = display;
  document.getElementById("time").style.display = display;
}

function link_already_exists(link) {
  //const sources = ["links", "kb", "deleted"];
  const sources = ["links", "kb"];
  for (let j = 0; j < sources.length; j++) {
    const source = sources[j];
    const links = load_links_from(source);

    for (let i = 0; i < links.length; i++) {
      //if (links[i].link == link || links[i].link.includes(link) || link.includes(links[i].link))
      if (links[i].link == link || links[i].link.includes(link))  // don't know why I had this: "link.includes(links[i].link)" - it caused a bug saving https://a.com/smth if https://a.com already exists
        return {"link": links[i], "source": source};
    }
  }
  return false;
}

function fill_the_collect_links_form_with_existing_data(existing_link) {
  const link = existing_link.link;
  all_input_elements_ids.forEach((element_id) => {
    if (link[element_id] && link[element_id] != "undefined") {
      const element = document.getElementById(element_id);
      element.value = link[element_id];

      //if (collect_links_textareas_ids.includes(element_id)) {
      //  adjust_textarea_size(element);
      //}
    }
  });
  //shirk_textareas_to_content();
}

const sources_map = {"links": "Queue", "kb": "Knowledge Base", "deleted": "Deleted"};

function adjust_if_link_already_exists(link) {
  const existing_link = link_already_exists(link);
  if (existing_link) {
    fill_the_collect_links_form_with_existing_data(existing_link);
    document.getElementById("save").innerText = `Update in ${sources_map[existing_link.source]}`;
    //document.getElementById("save").classList.add("btn-success");
    document.getElementById("save").dataset.source = existing_link.source;
    if (existing_link.source == "queue") {
      show_move_and_delete_buttons();
      disable_url_input_field();
    }
    else if (existing_link.source == "kb") {
      show_delete_button();
      disable_url_input_field();
    }
  }
}

function what_to_do_on_textareas_content_change(event) {
  adjust_textarea_size(event.target);
  bring_form_from_idle_to_active_state_on_link_value_only();
  enable_tags_hint_on_any_value_only();

  //if (!document.getElementById("save").classList.contains("context_menu_call"))
  //  suggest_tags();

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
  fill_stats_of_what_to_do_for_links();
}
