function bring_form_from_idle_to_active_state_on_link_value_only() {
  setTimeout(() => {
    if (document.getElementById("link").value)
      return bring_form_to_active_state();

    return bring_form_to_idle_state();
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
}

function save_link_into_storage(link) {
  save_link_to_local_storage(link);
  update_tags_in_local_storage(link.tags);
  update_stats_of_what_to_do_for_links(link);
  what_to_do_on_filter_change();
}

async function save_link() {
  let link = collect_data_from_the_save_link_form();
  get_hostname(link.link); // just validation of format to prevent saving of a broken link
  link = add_time_in_minutes_to_link(link);
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

  close_collect_form();
  what_to_do_on_filter_change();
  if (!link.source)
    show_toast("Link has been saved");
  else
    show_toast("Link has been updated");

  finish_onboarding_user();
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
  update_stats_of_what_to_do_for_links(link);
}

function save_link_to_local_storage(link) {
  let source = link.source || "links";

  let links = load_links_from(source);

  for (let i = 0; i < links.length; i++) {
    if (links[i].link == link.link) {
      const link_from_storage = links[i];
      if (link.date_created == undefined && link_from_storage.date_created)
        link.date_created = link_from_storage.date_created;
      //if (link.group_id == undefined && link_from_storage.group_id)  // ungroup on edit
      //  link.group_id = link_from_storage.group_id;
      if (link.time == undefined && link_from_storage.time) {
        link.time = link_from_storage.time;
        link.time_minutes = link_from_storage.time_minutes;
      }
      if (link.what_to_do == undefined && link_from_storage.what_to_do)
        link.what_to_do = link_from_storage.what_to_do;
      if (link.notes == undefined && link_from_storage.notes)
        link.notes = link_from_storage.notes;
      if (link.tags == undefined && link_from_storage.tags)
        link.tags = link_from_storage.tags;
      if (link.priority == undefined && link_from_storage.priority)
        link.priority = link_from_storage.priority;

      link.date_updated = Date.now();
      links.splice(i, 1);
      break;
    }
  }

  if (!link.date_created) {
    link.date_created = Date.now();
    link.date_updated = Date.now();
  }

  links.push(link);
  localStorage.setItem(source, JSON.stringify(links));
}

