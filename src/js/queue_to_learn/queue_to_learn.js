function onboard_user() {
  document.querySelectorAll(".onboarding").forEach((e) => { e.style.display = 'block'; });

  document.getElementById("saved_list").style.display = 'none';
  document.getElementById("choose_action_arrow_button").style.display = 'none';
  document.getElementById("grab_tab").style.borderRadius = '8px';
}
function finish_onboarding_user() {
  const saved_list_element = document.getElementById("saved_list");
  if (saved_list_element.style.display == 'block')
    return;

  document.querySelectorAll(".onboarding").forEach((e) => { e.style.display = 'none'; });
  document.getElementById("saved_list").style.display = 'block';
  document.getElementById("choose_action_arrow_button").style.display = 'block';
  document.getElementById("grab_tab").style.borderRadius = '8px 0 0 8px';
}


function draw_links_placeholder() {
  return `<p id="links_placeholder"><b>No links in Queue to learn.</b></p><p style="text-align: center; margin: 0 10%;">Use "Save active tab" button to save links here.</p>`;
}
function draw_links_error_message() {
  return `<p id="links_placeholder"><span style="font-size: 2em;">😲</span><br><b>Something went wrong...</b><br>Please <a href="#" id="copy_error_message_to_clipboard">click here</a> to copy an error message to clipboard and <a href="mailto:alexeyhimself@gmail.com">let us know</a></p>`;
}
function draw_no_links_found_placeholder() {
  return `<p id="links_placeholder"><b>No such links found.</b></p>`;
}

function enable_copy_error_message_to_clipboard_listener(element_id, error_message) {
  var element = document.getElementById(element_id);
  element.addEventListener('click', function (event) {
    navigator.clipboard.writeText(error_message);
  });
}

function display_links_export(number_of_links) {
  if (number_of_links > 0) {
    document.getElementById("number_of_links").innerHTML = number_of_links;
    document.getElementById("links_export").style.display = '';
  }
  else
    document.getElementById("links_export").style.display = 'none';
}

function draw_links_in_queue_tab(grouped_links, no_links_callback) {
  try {
    document.getElementById("filter").style.display = '';
    if (grouped_links.total == 0) {
      if (no_links_callback && check_if_any_link_exist("links"))
        document.getElementById("links_area").innerHTML = no_links_callback();
      else {
        document.getElementById("links_area").innerHTML = draw_links_placeholder();
        document.getElementById("filter").style.display = 'none';
      }
    }
    else {
      document.getElementById("links_area").innerHTML = draw_existing_grouped_links(grouped_links);
    }

  } catch (error) {
    console.error(error);
    document.getElementById("links_area").innerHTML = draw_links_error_message();
    document.getElementById("filter").style.display = 'none';
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

async function visualize_ungroup(link) {
  delete link.group_id;
  save_or_update_link_in_local_storage(link);
  what_to_do_on_filter_change();
  await sleep(200);
}

function enable_restore_tabs_listeners() {
  document.querySelectorAll('.bulk_saved_group_restore_link').forEach((element) => {
    element.addEventListener('click', async function (event) {
      group_id = event.target.dataset.groupId;

      const all_existing_links = load_links_from_local_storage();
      for (let i = 0; i < all_existing_links.length; i++) {
        let group_id_found = false;
        const link = all_existing_links[i];
        if (link.group_id == group_id) {
          //console.log(link.title);
          chrome.tabs.create({ url: link.link });
          await visualize_ungroup(link);
          group_id_found = true;
        }
        else if (group_id_found)
          break;
      }
    });
  });
}

function draw_time_based_links(links, no_links_callback) {
  try {
    document.getElementById("filter").style.display = '';
    if (links.length == 0) {
      if (no_links_callback && check_if_any_link_exist("links"))
        document.getElementById("links_area").innerHTML = no_links_callback();
      else {
        document.getElementById("links_area").innerHTML = draw_links_placeholder();
        document.getElementById("filter").style.display = 'none';
      }
    }
    else {
      document.getElementById("links_area").innerHTML = draw_existing_time_based_links(links);
      enable_restore_tabs_listeners();
    }
  } catch (error) {
    console.error(error);
    document.getElementById("links_area").innerHTML = draw_links_error_message();
    document.getElementById("filter").style.display = 'none';
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

const no_time_what_to_do = ["tool", "course", "people"];

function draw_link_in_queue_tab(item, what_to_do) {
  let links_html = '';

  if (!item.title)
    item.title = item.link;
  links_html += '<div class="queue-link">';
  
  if (item.time)
    links_html += `<span class="badge bg-warning text-dark">${item.time.replace('m', ' min').replace('h', ' hour ')}</span>`;
  else {
    if (!no_time_what_to_do.includes(item.what_to_do))
      links_html += `<span class="badge bg-warning text-dark">time not set</span>`;
  }

  if (["undefined", undefined, ""].includes(item.what_to_do))
    links_html += ` <span class="badge bg-secondary">type not set</span>`;
  else
    links_html += ` <span class="badge bg-secondary">${item.what_to_do}</span>`;

  const hostname = get_hostname(item.link);
  

  links_html += `<div class="btn-group queue-link-menu" style="float: inline-end; position: relative; top: 6px; width: auto;"> \
    <button type="button" class="btn btn-light dropdown-toggle dropdown-toggle-split- queue-link-button" data-bs-toggle="dropdown" aria-expanded="false" style="padding-: 6px;"> \
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
      </svg>
    </button> \
    <ul class="dropdown-menu"> \
      <li><a class="dropdown-item edit_in_queue" href="#" data-url="${item.link}">Edit...</a></li> \
      <!--li><hr class="dropdown-divider"></li--> \
      <li><a class="dropdown-item move_to_kb" href="#" data-url="${item.link}">Move to Knowledge Base</a></li> \
      <li><a class="dropdown-item delete_from_queue" href="#" data-url="${item.link}" data-reason="neutral">Delete</a></li> \
    </ul> \
  </div>`;

  links_html += ` <span class="hostname">${hostname}</span>`;
  links_html += `<br><a class="queue-link-a" href="${item.link}" target="_blank">${item.title.trim()}</a>`;
  
  links_html += '</div>';
  return links_html;
}

function draw_existing_grouped_links(grouped_links) {
  let links_html = '';
  let i = 1;
  const what_to_do_map = {"read-": "📖", "read--": '<i class="bi bi-book"></i> ', "read": '<img src="/images/bookalt.svg" style="height: 21px; padding-right: 1px; padding-bottom: 2px;"> ', "watch-": "🎬", "watch--": '<i class="bi bi-laptop"></i> ', "watch": '<img src="/images/camera-play.svg" style="height: 22px; padding-right: 3px; padding-bottom: 2px;"> ', "listen": '<img src="/images/headphones.svg" style="height: 22px; padding-bottom: 3px;"> ', "listen-": "🎧", "listen--": '<i class="bi bi-earbuds"></i> '};
  //const what_to_do_map = {"read": '<i class="bi bi-book-half"></i>', "watch": '<i class="bi bi-youtube"></i>', "listen": '<i class="bi bi-earbuds"></i>'};

  ["read", "watch", "listen", "others"].forEach((what_to_do) => {
    if (what_to_do == "others" && grouped_links[what_to_do].length > 0 && (grouped_links["read"].length > 0 || grouped_links["watch"].length > 0 || grouped_links["listen"].length > 0))
      links_html += `<p style="margin-top: 0px; font-size: 17px!important;">Everything else matching filter, ordered by descending priority (${grouped_links[what_to_do].length} links):</p>`;
    else if (what_to_do != "others" && grouped_links[what_to_do].length > 0) {
      if (i == 1)
        links_html += `<div id="top-3-section"><p style="margin-top: 0px; font-size: 17px!important;">`;
      else
        links_html += `<p style="margin-top: 10px; font-size: 17px!important;">`;
      if (what_to_do in what_to_do_map)
        links_html += `${what_to_do_map[what_to_do]} `;
      
      //links_html += `${grouped_links[what_to_do].length} top priority to ${what_to_do}</p>`;
      links_html += ` Top priority to ${what_to_do}</p>`;
    }

    for (let j = 0; j < grouped_links[what_to_do].length; j++) {
      const item = grouped_links[what_to_do][j];
      links_html += draw_link_in_queue_tab(item, what_to_do);
    }

    i++;
    if (i == 4)
      links_html += "</div>";
  });

  return links_html;
}

function days_ago(date, month, day) {
  const days_passed_since_created = calculate_days_passed_till_today(date);
  const weekday = new Date(date).toLocaleDateString('en-US', {weekday: 'short'});
  if (days_passed_since_created > 7)
    return `${month} ${day}`;
  if (days_passed_since_created == 0)
    return `${weekday}, ${month} ${day} (today)`;
  if (days_passed_since_created == 1)
    return `${weekday}, ${month} ${day} (yesterday)`;

  return `${weekday}, ${month} ${day}`;
}

function draw_existing_time_based_links(links) {
  let links_html = ''; //`<div id="top-3-section"><p><b>Most recently saved on top:</b></p>`;
  let group_id = 1;
  let group_started = false;
  let date_created = new Date(1).toLocaleDateString('en-US');
  for (let j = 0; j < links.length; j++) {
    const item = links[j];

    const item_date_created = new Date(item.date_created).toLocaleDateString('en-US');
    const month = new Date(item.date_created).toLocaleString('en-US', { month: 'short' });
    const date = new Date(item.date_created).getDate();
    if (item_date_created != date_created) {
      if (group_started)
        links_html += '</div>';
      group_started = false;
      links_html += `<p style="font-size: 17px!important;">${days_ago(item.date_created, month, date)}</p>`;
      date_created = item_date_created;
    }

    if (item.group_id && item.group_id != group_id) {
      if (group_started)
        links_html += '</div>';

      links_html += `<p class="bulk_saved_group_restore"><a href="#" class="bulk_saved_group_restore_link" data-group-id="${item.group_id}">Restore this group</a></p><div class="bulk_saved_group">`;
      group_started = true;
    }
    else if (!item.group_id && group_started) {
      links_html += '</div>';
      group_started = false;
    }
    
    links_html += draw_link_in_queue_tab(item);
    group_id = item.group_id;
  }
  links_html += '</div>';
  return links_html;
}

function group_filtered_links(filtered_links) {
  let links_to_read = [];
  let links_to_watch = [];
  let links_to_listen = [];
  let links_others = [];
  for (let i = 0; i < filtered_links.length; i++) {
    const link = filtered_links[i];
    if (link.what_to_do) {
      if (link.what_to_do == "read" && links_to_read.length < 3) {
        links_to_read.push(link);
      }
      else if (link.what_to_do == "watch" && links_to_watch.length < 3) {
        links_to_watch.push(link);
      }
      else if (link.what_to_do == "listen" && links_to_listen.length < 3) {
        links_to_listen.push(link);
      }
      else {
        links_others.push(link);
      }
    }
    else {
      links_others.push(link);
    }
  }
  
  return {"read": links_to_read, "watch": links_to_watch, "listen": links_to_listen, "others": links_others, 
          "total": links_to_read.length + links_to_watch.length + links_to_listen.length + links_others.length};
}

function filter_links(sorting) {
  const links = load_links_from_local_storage_sorted_by(sorting);
  let links_match_by_time = [];
  let links_without_time = [];

  const filtered_time = document.getElementById("find_time").value.toLowerCase();
  if (filtered_time != '') {
    const parsed_time = parse_time(filtered_time);
    if (Object.keys(parsed_time).length == 0)  // if couldn't parse the time limit filter
      return [];

    const filtered_time_minutes = parsed_time.hours * 60 + parsed_time.minutes;
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (!link.time_minutes) {
        links_without_time.push(link);
        continue;
      }
      if (filtered_time_minutes && link.time_minutes <= filtered_time_minutes)
        links_match_by_time.push(link);
    }
  }
  else {
    links_without_time = links;  // doesn't matter, could be a links_match_by_time = links too
  }

  const filtered_text = document.getElementById("find_text").value.toLowerCase();
  const fields_to_search_in = ["link", "title", "notes", "tags", "what_to_do"];
  let resulting_links = [];

  [links_match_by_time, links_without_time].forEach((list_of_links) => {
    for (let i = 0; i < list_of_links.length; i++) {
      const link = list_of_links[i];

      if (!link.time && "undefined".includes(filtered_text) && !no_time_what_to_do.includes(link.what_to_do)) { // !link.time here represents undefined time
        resulting_links.push(link);
        continue;
      }
      if (!link.time && "time not set".includes(filtered_text) && !no_time_what_to_do.includes(link.what_to_do)) {
        resulting_links.push(link);
        continue;
      }
      if (!link.what_to_do && "type not set".includes(filtered_text) && !no_time_what_to_do.includes(link.what_to_do)) {
        resulting_links.push(link);
        continue;
      }

      let full_text_match_found = false;
      for (let j = 0; j < fields_to_search_in.length; j++) {  // full text search
        const field_to_search_in = fields_to_search_in[j];
        if (!link[field_to_search_in])
          continue;

        if (link[field_to_search_in].toLowerCase().includes(filtered_text)) {
          resulting_links.push(link);
          full_text_match_found = true;
          break;
        }
      }

      if (!full_text_match_found) {
        let split_text_match_found_count = 0;
        const filtered_text_split = filtered_text.split(/\s+/);
        filtered_text_split.forEach((filtered_word) => {  // split text search
          for (let k = 0; k < fields_to_search_in.length; k++) {
            const field_to_search_in = fields_to_search_in[k];
            if (!link[field_to_search_in])
              continue;

            if (link[field_to_search_in].toLowerCase().includes(filtered_word)) {
              split_text_match_found_count++;
              break;
            }
          }
        });
        if (filtered_text_split.length == split_text_match_found_count)
          resulting_links.push(link);
      }
    }
  });

  return resulting_links;
}

function what_to_do_on_filter_change(event) {
  if (!check_if_any_link_exist())
    return onboard_user();

  finish_onboarding_user();

  const radio = document.querySelector('input[name="btnradio"]:checked');
  const filtered_links = filter_links(radio.id);
  if (radio.id == 'priority-based') {
    const grouped_filtered_links = group_filtered_links(filtered_links);
    draw_links_in_queue_tab(grouped_filtered_links, draw_no_links_found_placeholder);  
  }
  else {
    draw_time_based_links(filtered_links, draw_no_links_found_placeholder);
  }
  adjust_scroll_margin();
  draw_links_in_kb_tab();
  //draw_links_in_deleted_tab();
  enable_edit_in_queue_listeners();
  enable_edit_in_kb_listeners();
  enable_delete_from_kb_listeners();
  enable_move_to_kb_listeners();
  enable_delete_from_queue_listeners();
}

function delete_link_from_queue(url) {
  let links = load_links_from_local_storage();
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.link == url) {
      links.splice(i, 1);
      break;
    }
  }
  save_items_into_storage(links, "links");
}
function get_link_from_queue(url) {
  let links = load_links_from_local_storage();
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.link == url) {
      return link;
    }
  }
}

function enable_move_to_kb_listeners() {
  document.querySelectorAll(".move_to_kb").forEach((element) => {
    element.addEventListener('click', function (event) {
      let url = event.target.dataset.url; // queue
      if (!url)
        url = document.getElementById("link").value; // form
      const link = get_link_from_queue(url);
      save_link_to(link, "kb");
      delete_link_from_queue(url);
      what_to_do_on_filter_change();
      show_toast("Link moved to Knowledge Base");
    });
  });
}

function enable_delete_from_queue_listeners() {
  document.querySelectorAll(".delete_from_queue").forEach((element) => {
    element.addEventListener('click', async function (event) {
      let url = event.target.dataset.url; // queue
      if (!url)
        url = document.getElementById("link").value; // form
      const reason = event.target.dataset.reason;
      const link = get_link_from_queue(url);
      link["reason"] = reason;
      save_link_to(link, "deleted");
      delete_link_from_queue(url);
      what_to_do_on_filter_change();
      show_toast("Link has been deleted");
      //const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      //if (tab.url == url)
      //  chrome.tabs.remove(tab.id, function() { });
    });
  });
}

function show_move_and_delete_buttons() {
  document.getElementById("move_to_kb").style.display = 'block';
  document.getElementById("delete_from_queue").style.display = 'block';
}
function hide_move_and_delete_buttons() {
  document.getElementById("move_to_kb").style.display = 'none';
  document.getElementById("delete_from_queue").style.display = 'none';
}
function show_delete_button() {
  document.getElementById("move_to_kb").style.display = 'none';
  document.getElementById("delete_from_queue").style.display = 'block';
}

function enable_edit_in_queue_listeners() {
  document.querySelectorAll(".edit_in_queue").forEach((element) => {
    element.addEventListener('click', function (event) {
      const url = event.target.getAttribute("data-url");
      //open_collect_form();
      open_empty_collect_form();
      show_move_and_delete_buttons();
      const save_element = document.getElementById("save");
      save_element.classList.remove("context_menu_call");  // clean if left from unsaved tab
      save_element.dataset.callback = "queue";
      save_element.dataset.source = "queue";

      const link = get_link_from_queue(url);
      all_input_elements_ids.forEach((element_id) => {
        let element = document.getElementById(element_id);
        //console.log(element_id, link[element_id])
        if (link[element_id]) {
          element.value = link[element_id];
        }
      });

      //let link = document.getElementById("link");
      //link.value = url;
      suggest_tags({"link": url, "title": link.title});
      bring_form_to_active_state();

      shirk_textareas_to_content();

      //show_toast("Link has been updated");
      //link.dispatchEvent(new InputEvent("change"));
    });
  });
}

function adjust_scroll_margin() {
  return;

  const links_area = document.getElementById('container'); 
  const scroll_exists = links_area.scrollHeight > links_area.clientHeight;
  if (!scroll_exists)
    links_area.style.paddingRight = '8px';
  else
    links_area.style.paddingRight = '0px';
}

function switch_to_saved_list() {
  //document.getElementById("saved_list").style.display = 'block';
  document.getElementById("save_form").style.display = 'none';
  document.getElementById("switch_to_saved").classList.add("btn-success");
  document.querySelectorAll(".choose_action_button").forEach((e) => {e.classList.remove("btn-primary")});
  what_to_do_on_filter_change();
}

function enable_manage_links() {
  enable_buttons_listeners({
    //"find-tab": what_to_do_on_filter_change,
    //"links_export_csv": download_as_csv,
    //"links_export_json": download_as_json,
    //"switch_to_saved": switch_to_saved_list,
  });

  what_to_do_on_filter_change();
  enable_textarea_listener("find_text", what_to_do_on_filter_change);
  enable_textarea_listener("find_time", what_to_do_on_filter_change);

  //enable_move_to_kb_listeners();
  //enable_delete_from_queue_listeners();
}
