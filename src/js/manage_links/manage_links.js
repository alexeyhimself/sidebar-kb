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
  } catch (error) {
    console.error(error);
    document.getElementById("links_area").innerHTML = draw_links_error_message();
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function draw_links(links, no_links_callback) {
  try {
    if (!links)
      links = load_links_from_local_storage_sorted_by();

    if (links.length == 0) {
      if (no_links_callback)
        document.getElementById("links_area").innerHTML = no_links_callback();
      else
        document.getElementById("links_area").innerHTML = draw_links_placeholder();
    }
    else
      document.getElementById("links_area").innerHTML = draw_existing_links(links);

    display_links_export(links.length);
    // document.getElementById("find_text").focus();
  } catch (error) {
    console.error(error);
    document.getElementById("links_area").innerHTML = draw_links_error_message();
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function draw_existing_grouped_links(grouped_links) {
  let links_html = '';
  let i = 1;
  const what_to_do_map = {"read": "📚", "watch": "📺", "listen": "🎧"};

  ["read", "watch", "listen", "others"].forEach((what_to_do) => {
    if (what_to_do == "others" && grouped_links[what_to_do].length > 0)
      links_html += `<p><br><b>Everything else matching filter (${grouped_links[what_to_do].length} items), ordered by descending priority:</b></p>`;
    else if (grouped_links[what_to_do].length > 0) {
      if (i == 1)
        links_html += `<p><b>`;
      else
        links_html += `<p style="margin-top: 18px;"><b>`;
      if (what_to_do in what_to_do_map)
        links_html += `${what_to_do_map[what_to_do]} `;
      links_html += `${grouped_links[what_to_do].length} top priority to ${what_to_do}:</b></p>`;
      i++;
    }

    grouped_links[what_to_do].forEach((item) => {
      if (!item.title)
        item.title = item.link;
      links_html += '<p>';

      if (item.time && what_to_do != "others")
        links_html += `<span class="badge bg-warning text-dark">${item.time.replace('m', ' min').replace('h', ' hour ')}</span> `;
      if (item.time && what_to_do == "others")
        links_html += `<span class="badge bg-warning text-dark">${item.time.replace('m', ' min').replace('h', ' hour ')}</span> <span class="badge bg-secondary text-dark-">${item.what_to_do}</span> `;
      
      links_html += `<a href="${item.link}" target="_blank">${item.title.trim()}</a> `;

      if (item.tags) {
        links_html += ` | <a href="">${item.tags.split(',').length}&nbsp;tag` //links_html += `${item.tags}`;
        if (item.tags.split(',').length > 1)
          links_html += 's';
      }
      if (item.notes) {
        if (item.tags)
          links_html += ' + a note';
        else
          links_html += ' | <a href="">a note';
      }
      if (item.tags || item.notes)
        links_html += '...';

      links_html += '</a>';
      links_html += '</p>';
    });
  });

  return links_html;
}

function draw_existing_links(links) {
  let links_html = '';
  links.forEach((item) => {
    if (!item.title)
      item.title = item.link;
    links_html += `<p><a href="${item.link}" target="_blank">${item.title}</a>`;

    if (item.time || item.priority || item.tags)
      links_html += '<br>';

    if (item.time)
      links_html += `${item.what_to_do} time: ${item.time}, `;
    if (item.priority)
      links_html += `priority: ${item.priority}, `;
    if (item.tags)
      links_html += `tags: ${item.tags}`;

    links_html += '</p>';
  });

  return links_html;
}

/*
function convert_time_string_to_minutes(time) {  // "1h 30m" => 90
  if (!time)
    return 0;
  time = time.replace(/ /g, '');

  let hours = time.split('h');
  if (hours.length == 2) {
    time = hours[1];
    hours = hours[0];
  }
  else
    hours = 0;
  let minutes = time.split('m');
  if (minutes.length == 2) {
    minutes = minutes[0];
  }
  else
    minutes = 0;

  return parseInt(hours) * 60 + parseInt(minutes);
}

function calculate_links_stats(importance) {
  if (!importance)
    importance = 0;

  let links = load_links_from_local_storage();
  let stats = {};
  for (let i in links) {
    let link = links[i];
    if (link.importance < importance)
      continue;

    let time = convert_time_string_to_minutes(link.time);
    if (!stats[link.what_to_do])
      stats[link.what_to_do] = time;
    else
      stats[link.what_to_do] += time;
  }
  return stats;
}
*/

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
  const filtered_text = document.getElementById("find_text").value;
  const filtered_time = document.getElementById("find_time").value;
  const filtered_time_minutes = convert_time_to_minutes(filtered_time);

  const links = load_links_from_local_storage_sorted_by();
  let links_match_by_time = [];
  let links_without_time = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.time_minutes) {
      if (filtered_time_minutes && link.time_minutes <= filtered_time_minutes) {
        links_match_by_time.push(link);
      }
      else if (!filtered_time_minutes) {
        links_without_time.push(link);
      }
    }
    else {
      links_without_time.push(link);
    }
  }

  let resulting_links = [];
  for (let i = 0; i < links_match_by_time.length; i++) {
    const link = links_match_by_time[i];
    if (link.title) {
      if (link.title.toLowerCase().includes(filtered_text.toLowerCase())) {
        resulting_links.push(link);
        continue;
      }
    }
    if (link.notes) {
      if (link.notes.toLowerCase().includes(filtered_text.toLowerCase())) {
        resulting_links.push(link);
        continue;
      }
    }
    if (link.tags) {
      if (link.tags.toLowerCase().includes(filtered_text.toLowerCase())) {
        resulting_links.push(link);
        continue;
      }
    }
    if (link.what_to_do) {
      if (link.what_to_do.toLowerCase().includes(filtered_text.toLowerCase())) {
        resulting_links.push(link);
        continue;
      }
    }
  }

  for (let i = 0; i < links_without_time.length; i++) {
    const link = links_without_time[i];
    if (link.title) {
      if (link.title.toLowerCase().includes(filtered_text.toLowerCase())) {
        resulting_links.push(link);
        continue;
      }
    }
    if (link.notes) {
      if (link.notes.toLowerCase().includes(filtered_text.toLowerCase())) {
        resulting_links.push(link);
        continue;
      }
    }
    if (link.tags) {
      if (link.tags.toLowerCase().includes(filtered_text.toLowerCase())) {
        resulting_links.push(link);
        continue;
      }
    }
    if (link.what_to_do) {
      if (link.what_to_do.toLowerCase().includes(filtered_text.toLowerCase())) {
        resulting_links.push(link);
        continue;
      }
    }
  }
  return resulting_links;
}

function what_to_do_on_filter_change(event) {
  const filtered_links = filter_links();
  const grouped_filtered_links = group_filtered_links(filtered_links);
  //draw_links(filtered_links, draw_no_links_found_placeholder);
  draw_grouped_links(grouped_filtered_links, draw_no_links_found_placeholder);
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
