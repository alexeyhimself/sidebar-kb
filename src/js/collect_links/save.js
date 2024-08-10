function enable_button_on_link_value_only() {
  setTimeout(() => {
    const link = document.getElementById("link").value;
    if (link) {
      bring_form_to_active_state();
      //suggest_what_to_do(link);
    }
    else {
      bring_form_to_idle_state();
    }
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
}

function add_time_in_minutes(link) {
  if (!link.time)
    return link;

  const parsed_time = parse_time(link.time);
  if (!parsed_time)
    return link;

  // rewrite format to "1h 30m"
  link["time_minutes"] = parsed_time.hours * 60 + parsed_time.minutes;
  let time = "";
  if (parsed_time.hours)
    time += parsed_time.hours + "h";
  if (parsed_time.hours && parsed_time.minutes)
    time += " ";
  if (parsed_time.minutes)
    time += parsed_time.minutes + "m";
  link["time"] = time;

  return link;
}

function reset_form_state() {
  bring_form_to_idle_state();
  clear_save_link_form();
  enable_tags_hint_on_any_value_only();
  hide_move_and_delete_buttons();

  document.getElementById("save").innerText = "Save";
  document.getElementById("save").classList.remove("btn-success");
  delete document.getElementById("save").dataset.source;
}

function save_link_into_storage(link) {
  save_link_to_local_storage(link);
  update_tags_in_local_storage(link.tags);
  update_stats_of_what_to_do_for_links(link);
  what_to_do_on_filter_change();
}

async function close_active_tab(url) {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  if (tab.url == url)
    chrome.tabs.remove(tab.id, function() { });
}

async function save_link() {
  let link = collect_data_from_the_save_link_form();
  get_hostname(link.link); // just validation of format to prevent saving of a broken link
  link = add_time_in_minutes(link);
  save_link_into_storage(link);
  reset_form_state();

  let save_element = document.getElementById("save");
  if (save_element.classList.contains("context_menu_call")) {
    save_element.classList.remove("context_menu_call");
    // if same link then close tab
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    chrome.tabs.remove(tab.id, function() { });
    //window.close(); // really? why is this?
  }
  if (save_element.classList.contains("auto_fill"))
    save_element.classList.remove("auto_fill");

  //if (save_element.dataset.callback == "queue")
  //  close_active_tab(link.link);

  close_collect_form();
  what_to_do_on_filter_change();
  show_toast("Tab has been saved to Queue");
}

function save_link_to(link, where) {
  let links = load_links_from(where);
  links.push(link);
  localStorage.setItem(where, JSON.stringify(links));
}

function update_link_in_storage(link) {
  let source = link.source || "links";

  let links = load_links_from(source);
  for (let i = 0; i < links.length; i++) {
    if (links[i].link == link.link) {
      link.date_updated = Date.now();
      links.splice(i, 1);
      break;
    }
  }

  links.push(link);
  localStorage.setItem(source, JSON.stringify(links));
}

function save_link_to_local_storage(link) {
  let source = link.source || "links";

  let links = load_links_from(source);
  for (let i = 0; i < links.length; i++) {
    if (links[i].link == link.link) {
      const link_from_storage = links[i];
      link.date_created = Date.now(); //link_from_storage.date_created;
      if (!link.group_id && link_from_storage.group_id)
        link.group_id = link_from_storage.group_id;
      if (!link.time && link_from_storage.time) {
        link.time = link_from_storage.time;
        link.time_minutes = link_from_storage.time_minutes;
      }
      if (!link.what_to_do && link_from_storage.what_to_do)
        link.what_to_do = link_from_storage.what_to_do;
      if (!link.notes && link_from_storage.notes)
        link.notes = link_from_storage.notes;
      if (!link.tags && link_from_storage.tags)
        link.tags = link_from_storage.tags;
      if (!link.priority && link_from_storage.priority)
        link.priority = link_from_storage.priority;

      link.date_updated = Date.now();
      links.splice(i, 1);
      break;
    }
  }

  links.push(link);
  localStorage.setItem(source, JSON.stringify(links));
}

function enable_buttons_listeners(buttons) {
  for (let button_id in buttons) {
    //console.log(button_id);
    var element = document.getElementById(button_id);
    element.addEventListener('click', function (event) {
      buttons[button_id]();
    });
  }
}
