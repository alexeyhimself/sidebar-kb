function load_links_from_local_storage() {
  let links = localStorage.getItem("links") || "[]";
  return JSON.parse(links);
}

function load_links_from_local_storage_sorted_by(sorting) {
  let links = load_links_from_local_storage();
  if (sorting) {
    if (sorting == "priority-based")
      return links.sort(sort_dicts_by_value("-priority"));
    else
      return links.sort(sort_dicts_by_value("-date_created"));
  }
  else {
    return links.sort(sort_dicts_by_multiple_values("-priority", "-date_created"));  
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
