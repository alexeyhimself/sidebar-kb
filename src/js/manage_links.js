function draw_links_placeholder() {
  return `<p id="links_placeholder"><b>You have no saved links yet.</b><br>Collect some &mdash; they will appear 👍</p>`;
}
function draw_links_error_message() {
  return `<p id="links_placeholder"><span style="font-size: 2em;">😲</span><br><b>Something went wrong...</b><br>Please <a href="#" id="copy_error_message_to_clipboard">click here to copy an error message to clipboard</a> and <a href="mailto:alexeyhimself@gmail.com">let us know</a></p>`;
}

function draw_links() {
  let links_html = '';
  try {
    const links = load_links_from_local_storage();

    if (links.length == 0)
      links_html = draw_links_placeholder();
    else
      links_html = draw_existing_links(links);

    if (links.length > 10) {
      document.getElementById("number_of_links").innerHTML = links.length;
      document.getElementById("links_export").style.display = '';
    }
    document.getElementById("links_area").innerHTML = links_html;
  } catch (error) {
    console.error(error);
    links_html = draw_links_error_message();
    document.getElementById("links_area").innerHTML = links_html;
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function draw_existing_links(links) {
  let links_html = '';
  links.forEach((item) => {
    if (!item.title)
      item.title = item.link;
    links_html += `<p><a href="${item.link}" target="_blank">${item.title}</a>`;

    if (item.time || item.importance || item.tags)
      links_html += '<br>';

    if (item.time)
      links_html += `${item.what_to_do} time: ${item.time}, `;
    if (item.importance)
      links_html += `importance: ${item.importance}, `;
    if (item.tags)
      links_html += `tags: ${item.tags}`;

    links_html += '</p>';
  });

  return links_html;
}

function load_links_from_local_storage() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);
      links.sort(sort_dicts_by_multiple_values("-importance", "-date_created"));
  return links;
}

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

var chart_total_max = 0;
var chart_what_to_do_max = 0;

function calculate_links_stats_for_importance_bar(what_to_do) {
  let links = load_links_from_local_storage();
  let stats = {};
  let max = 0;
  for (let i in links) {
    let link = links[i];
    if (!link.importance)
      continue;

    if (what_to_do) {
      if (link.what_to_do != what_to_do)
        continue;
    }

    if (!stats[link.importance])
      stats[link.importance] = 1;
    else
      stats[link.importance] += 1;

    if (stats[link.importance] > max)
      max = stats[link.importance];
  }
  
  if (what_to_do)
    chart_what_to_do_max = max;
  else
    chart_total_max = max;

  return stats;
}
function draw_links_stats_chart_under_importance_bar(chart_id, what_to_do) {
  const stats = calculate_links_stats_for_importance_bar(what_to_do);
  const max = chart_total_max;

  let content = '';
  for (let i = 0; i < 100; i++) {
    let items = stats[i];
    if (items)
      content += `<div style="height: ${items * 100 / (max * 1.2)}%;" class="${chart_id}"></div>`;
    else
      content += `<div style="height: 1px;" class="${chart_id}"></div>`;
  }
  document.getElementById(chart_id).innerHTML = content;
}

function enable_copy_error_message_to_clipboard_listener(element_id, error_message) {
  var element = document.getElementById(element_id);
  element.addEventListener('click', function (event) {
    navigator.clipboard.writeText(error_message);
  });
}

function enable_manage_links() {
  enable_buttons_listeners({
    "find-tab": draw_links,
    "links_export": download_as_csv,
  });
}
