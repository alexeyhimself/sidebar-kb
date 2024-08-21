function save_items_into_storage(links, where) {
  localStorage.setItem(where, JSON.stringify(links));
}

function load_links_from_local_storage(source) {
  source = source || "links";
  let links = localStorage.getItem(source) || "[]";
  return JSON.parse(links);
}

function check_if_any_link_exist_in(source) {
  if (localStorage.getItem(source))
    if (localStorage.getItem(source) != "[]")
      return true;
  return false;
}
function check_if_any_link_exist(source) {
  if (source)
    return check_if_any_link_exist_in(source);

  const data_sources = ["links", "kb", "deleted"];
  for (let i = 0; i < data_sources.length; i++) {
    if (check_if_any_link_exist_in(data_sources[i]))
      return true; 
  }
  return false;
}

function load_links_from_local_storage_sorted_by(sorting) {
  let links = load_links_from_local_storage();
  if (sorting) {
    if (sorting == "priority-based")
      return links.sort(sort_dicts_by_value("-priority"));
    else
      return links.sort(sort_dicts_by_value("-date_updated"));
  }
  else {
    return links.sort(sort_dicts_by_multiple_values("-priority", "-date_updated"));  
  }
}

function load_links_from(where) {
  let links = localStorage.getItem(where) || "[]";
  return JSON.parse(links);
}

function parse_time(time) {
  if (time.includes("h")) {
    if (time.includes("m")) {
      const match = time.match(/(\d+)\s*h[ours]*\s*(\d+)\s*m[inutes]*/);
      if (match)
        return {"hours": parseInt(match[1]), "minutes": parseInt(match[2])};
      else
        return {};
    }
    else {
      const match = time.match(/(\d+)\s*h[ours]*/);
      if (match)
        return {"hours": parseInt(match[1]), "minutes": 0};
      else
        return {};
    }
  }
  else if (time.includes("m")) {
    const match = time.match(/(\d+)\s*m[inutes]*/);
    if (match)
      return {"hours": 0, "minutes": parseInt(match[1])};
    else
      return {};
  }
  else {
    const match = time.match(/(\d+)/);
    if (match)
      return {"hours": 0, "minutes": parseInt(match[1])};
    else
      return {};
  }
}

function get_hostname(link) {  // https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
  //console.log(link);
  try {
    const { hostname } = new URL(link);
    return hostname.replace(/^www\./g, '');  // remove starting "www."  
  }
  catch {
    return "Invalid URL";
  }
}

function adjust_textarea_size(element) {  // https://stackoverflow.com/questions/995168/textarea-to-resize-based-on-content-length
  element.style.height = "0px";
  element.style.height = (element.scrollHeight) + "px";
}

function show_toast(text) {
  const check = '<svg style="margin-bottom: 2px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg> ';
  document.getElementById("toast-body").innerHTML = check + text;
  toast.show();
}

function add_time_in_minutes_to_link(link) {
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

async function close_active_tab(url) { // not used
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  if (tab.url == url)
    chrome.tabs.remove(tab.id, function() { });
}

function fix_date_created_updated(link) {
  if (!link.date_created)
    link.date_created = Date.now();
  if (!link.date_updated)
    link.date_updated = Date.now();

  return link;
}

function bring_form_from_idle_to_active_state_on_link_value_only() {
  setTimeout(() => {
    if (document.getElementById("link").value)
      return bring_form_to_active_state();

    return bring_form_to_idle_state();
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
}
