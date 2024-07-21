function draw_links_placeholder() {
  return `<p id="links_placeholder"><b>You have no saved links yet.</b><br>Collect some &mdash; they will appear 👍</p>`;
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

function draw_grouped_links(grouped_links, no_links_callback) {
  const all_existing_links = load_links_from_local_storage_sorted_by();

  try {
    document.getElementById("filter").style.display = '';
    if (grouped_links.total == 0) {
      if (no_links_callback && all_existing_links.length > 0)
        document.getElementById("links_area").innerHTML = no_links_callback();
      else {
        document.getElementById("links_area").innerHTML = draw_links_placeholder();
        document.getElementById("filter").style.display = 'none';
      }
    }
    else
      document.getElementById("links_area").innerHTML = draw_existing_grouped_links(grouped_links);

    display_links_export(grouped_links.total);
    // document.getElementById("find_text").focus();

    enable_move_to_kb_listeners();
    enable_delete_from_queue_listeners();
    enable_edit_in_queue_listeners();
  } catch (error) {
    console.error(error);
    document.getElementById("links_area").innerHTML = draw_links_error_message();
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function draw_existing_grouped_links(grouped_links) {
  let links_html = '';
  let i = 1;
  const what_to_do_map = {"read-": "📚", "watch-": "🖥️", "listen-": "🎧"};
  //const what_to_do_map = {"read": '<i class="bi bi-book-half"></i>', "watch": '<i class="bi bi-youtube"></i>', "listen": '<i class="bi bi-earbuds"></i>'};

  ["read", "watch", "listen", "others"].forEach((what_to_do) => {
    if (what_to_do == "others" && grouped_links[what_to_do].length > 0 && (grouped_links["read"].length > 0 || grouped_links["watch"].length > 0 || grouped_links["listen"].length > 0))
      links_html += `<p><b>Everything else matching filter (${grouped_links[what_to_do].length} items), ordered by descending priority:</b></p>`;
    else if (what_to_do != "others" && grouped_links[what_to_do].length > 0) {
      if (i == 1)
        links_html += `<div id="top-3-section"><p><b>`;
      else
        links_html += `<p style="margin-top: 18px;"><b>`;
      if (what_to_do in what_to_do_map)
        links_html += `${what_to_do_map[what_to_do]} `;
      
      links_html += `${grouped_links[what_to_do].length} top priority to ${what_to_do}:</b></p>`;
    }

    for (let j = 0; j < grouped_links[what_to_do].length; j++) {
    //grouped_links[what_to_do].forEach((item) => {
      const item = grouped_links[what_to_do][j];

      if (!item.title)
        item.title = item.link;
      links_html += '<p class="queue-link">';

      if (item.time)
        links_html += `<span class="badge bg-warning text-dark">${item.time.replace('m', ' min').replace('h', ' hour ')}</span> `;
      else
        links_html += `<span class="badge bg-warning text-dark">undefined</span> `;

      if (what_to_do == "undefined" || what_to_do === undefined)
        links_html += `<span class="badge bg-secondary">undefined</span> `;
      else if (what_to_do == "others") {
        if (item.what_to_do == "undefined" || item.what_to_do === undefined)
          links_html += `<span class="badge bg-secondary">undefined</span> `;
        else
          links_html += `<span class="badge bg-secondary">${item.what_to_do}</span> `;
      }

      const hostname = get_hostname(item.link);
      links_html += `${hostname}: <a href="${item.link}" target="_blank">${item.title.trim()}</a>`;
      links_html += `<a href="#" data-bs-toggle="collapse" data-bs-target="#collapse-${item.date_created}-${j}" aria-expanded="false" aria-controls="collapseOne"><img src="images/arrow-down.png" style="width: 12px; margin-left: 7px;"> `;
      /*
      if (item.tags) {
        links_html += `| <a href="#" data-bs-toggle="collapse" data-bs-target="#collapse-${item.date_created}-${j}" aria-expanded="false" aria-controls="collapseOne">${item.tags.split(',').length}&nbsp;tag` //links_html += `${item.tags}`;
        if (item.tags.split(',').length > 1)
          links_html += 's';
      }
      if (item.notes) {
        if (item.tags)
          links_html += ' + a note';
        else
          links_html += '| <a href="">a note';
      }
      if (item.tags || item.notes)
        links_html += '...';
      */
      links_html += '</a> ';

      //links_html += ` ${item.priority}`;
      links_html += `<div id="collapse-${item.date_created}-${j}" class="accordion-collapse collapse" data-bs-parent="#accordionExample"><div class="accordion-body">`;
      
      /*
      links_html += `<a href="#" data-url="${item.link}" class="move_to_kb btn btn-success btn-sm">move to knowledge base</a> `;
      links_html += `<a href="#" data-url="${item.link}" class="move_to_kb- btn btn-warning btn-sm">edit</a> `;
      links_html += `<a href="#" data-url="${item.link}" class="move_to_kb- btn btn-danger btn-sm">delete</a><br>`;
      */
      
      links_html += `<b>Actions:</b><br>`;
      links_html += `<a href="#" data-url="${item.link}" class="edit_in_queue">Edit...</a><br>`;
      links_html += `<a href="#" data-url="${item.link}" class="move_to_kb">Move to Knowledge Base</a><br>`;
      links_html += 'Remove from Queue with a reason:';
      links_html += '<ul style="margin-bottom: 5px;">';
      links_html += `<li><span class="badge bg-secondary">neutral</span> <a href="#" data-url="${item.link}" class="delete_from_queue" data-reason="neutral">Not for saving in a Knowledge Base, not that useful</a></li>`;
      links_html += `<li><span class="badge bg-secondary">neutral</span> <a href="#" data-url="${item.link}" class="delete_from_queue" data-reason="duplicate">Duplicate link. Such link already exists</a></li>`;
      links_html += `<li><span class="badge bg-secondary">negative</span> <a href="#" data-url="${item.link}" class="delete_from_queue" data-reason="dontlike">Avoid such stuff. Don't want to waste time on such stuff</a></li>`;
      links_html += `<li><span class="badge bg-secondary">trash</span> <a href="#" data-url="${item.link}" class="delete_from_queue" data-reason="mistake" style="margin-bottom: 8px;">Do not save such links: they're not for learning</a></li>`;
      links_html += '</ul>';
      //https://calendar.google.com/calendar/render?action=TEMPLATE&text=Example+Google+Calendar+Event&details=More+help+see:+https://support.google.com/calendar/thread/81344786&dates=20201231T160000/20201231T170000&recur=RRULE:FREQ%3DWEEKLY
      // from: https://support.google.com/calendar/thread/81344786/how-do-i-generate-add-to-calendar-link-from-our-own-website?hl=en

      if (item.tags)
        links_html += `<b>Tags:</b> ${item.tags}<br>`;
      if (item.notes)
        links_html += `<b>Notes:</b> ${item.notes}<br>`;
      
      links_html += `</div></div>`;
      //links_html += '</p>';
    }

    i++;
    if (i == 4)
      links_html += "</div>"
  });

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

function filter_links() {
  const links = load_links_from_local_storage_sorted_by();
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

      if (!link.time && "undefined".includes(filtered_text)) { // !link.time here represents undefined time
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
  const filtered_links = filter_links();
  const grouped_filtered_links = group_filtered_links(filtered_links);
  //draw_links(filtered_links, draw_no_links_found_placeholder);
  draw_grouped_links(grouped_filtered_links, draw_no_links_found_placeholder);
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
  localStorage.setItem("links", JSON.stringify(links));
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
      const url = event.target.getAttribute("data-url");
      const link = get_link_from_queue(url);
      save_link_to(link, "kb");
      delete_link_from_queue(url);
      what_to_do_on_filter_change();
    });
  });
}

function enable_delete_from_queue_listeners() {
  document.querySelectorAll(".delete_from_queue").forEach((element) => {
    element.addEventListener('click', async function (event) {
      const url = event.target.getAttribute("data-url");
      const reason = event.target.getAttribute("data-reason");
      const link = get_link_from_queue(url);
      link["reason"] = reason;
      save_link_to(link, "deleted");
      delete_link_from_queue(url);
      what_to_do_on_filter_change();

      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      if (tab.url == url)
        chrome.tabs.remove(tab.id, function() { });
    });
  });
}

function enable_edit_in_queue_listeners() {
  document.querySelectorAll(".edit_in_queue").forEach((element) => {
    element.addEventListener('click', function (event) {
      const url = event.target.getAttribute("data-url");
      let a = document.getElementById("save-tab");
      bootstrap.Tab.getInstance(a).show();
      open_collect_form();
      const save_element = document.getElementById("save");
      save_element.classList.remove("context_menu_call");  // clean if left from unsaved tab
      let link = document.getElementById("link");
      link.value = url;
      link.dispatchEvent(new InputEvent("change"));
      save_element.dataset.callback = "queue";
    });
  });
}

function enable_manage_links() {
  enable_buttons_listeners({
    // "find-tab": draw_grouped_links,
    "find-tab": what_to_do_on_filter_change,
    "links_export_csv": download_as_csv,
    "links_export_json": download_as_json,
  });
  enable_textarea_listener("find_text", what_to_do_on_filter_change);
  enable_textarea_listener("find_time", what_to_do_on_filter_change);
}
