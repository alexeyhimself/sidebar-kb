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

  const time_minutes = convert_time_to_minutes(link.time);
  link["time_minutes"] = time_minutes;
  return link;
}

async function save_link() {
  let link = collect_data_from_the_save_link_form();
  get_hostname(link.link); // just validation of format to prevent saving of a broken link
  link = add_time_in_minutes(link);
  save_link_to_local_storage(link);
  update_tags_in_local_storage(link.tags);
  update_stats_of_what_to_do_for_links(link);
  bring_form_to_idle_state();
  clear_save_link_form();
  enable_tags_hint_on_any_value_only();

  document.getElementById("save").innerText = "Add to Queue";
  document.getElementById("save").classList.remove("btn-warning");

  let save_element = document.getElementById("save");
  if (save_element.classList.contains("context_menu_call")) {
    save_element.classList.remove("context_menu_call");
    // if same link then close tab
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    chrome.tabs.remove(tab.id, function() { });
    window.close();
  }
  if (save_element.classList.contains("auto_fill"))
    save_element.classList.remove("auto_fill");
}

function save_link_to_local_storage(link) {
  let links = load_links_from_local_storage();
  for (let i = 0; i < links.length; i++) {
    if (links[i].link == link.link) {
      links.splice(i, 1);
      break;
    }
  }

  links.push(link);
  localStorage.setItem("links", JSON.stringify(links));
}

function enable_buttons_listeners(buttons) {
  for (let button_id in buttons) { 
    var element = document.getElementById(button_id);
    element.addEventListener('click', function (event) {
      buttons[button_id]();
    });
  }
}
