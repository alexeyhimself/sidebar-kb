function enable_save_button() {
  document.getElementById("save").classList.remove("disabled");
  document.getElementById("priority").style.setProperty('--sliderColor', "#0075ff");
  let elements = document.querySelectorAll(".chart_what_to_do");
  elements.forEach(function(element) {
    element.style.background = "#0075ff";
  });
}
function disable_save_button() {
  document.getElementById("save").classList.add("disabled");
  document.getElementById("priority").style.setProperty('--sliderColor', "#6ba2ff");
  let elements = document.querySelectorAll(".chart_what_to_do");
  elements.forEach(function(element) {
    element.style.background = "#6ba2ff";
  });
}
function enable_button_on_link_value_only() {
  setTimeout(() => {
    const link = document.getElementById("link").value;
    if (link) {
      enable_save_button();
      //suggest_what_to_do(link);
    }
    else {
      disable_save_button();
    }
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
}

async function save_link() {
  const link = collect_data_from_the_save_link_form();
  get_hostname(link.link); // just validation of format to prevent saving of a broken link
  save_link_to_local_storage(link);
  update_tags_in_local_storage(link.tags);
  update_stats_of_what_to_do_for_links(link);
  reset_collect_links_form_state_after_save();
  enable_tags_hint_on_any_value_only();

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
