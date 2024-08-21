async function save_link(link) {
  if (!link)
    link = collect_data_from_the_save_link_form();

  get_hostname(link.link); // just validation of format to prevent saving of a broken link
  link = add_time_in_minutes_to_link(link);
  
  save_or_update_link_in_local_storage(link);
  update_tags_in_local_storage(link.tags);
  update_stats_of_what_to_do_for_links(link);
  what_to_do_on_filter_change();

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
  save_items_into_storage(links, where);
}

function save_or_update_link_in_local_storage(link) {
  let source = link.source || "links";

  let links = load_links_from(source);
  for (let i = 0; i < links.length; i++) {
    if (links[i].link == link.link) {
      const link_from_storage = links[i];
      ["date_created", "time", "time_minutes", "what_to_do", "notes", "tags", "priority"].forEach((attr) => {
        if (link[attr] == undefined && link_from_storage[attr])
          link[attr] = link_from_storage[attr];
      });

      links.splice(i, 1);
      break;
    }
  }

  link = fix_date_created_updated(link);
  links.push(link);

  save_items_into_storage(links, source);
}

