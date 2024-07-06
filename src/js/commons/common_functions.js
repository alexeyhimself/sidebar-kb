function load_links_from_local_storage() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);
      //links.sort(sort_dicts_by_multiple_values("-priority", "-date_created"));
  return links;
}

function load_links_from_local_storage_sorted_by() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);
      links.sort(sort_dicts_by_multiple_values("-priority", "-date_created"));
  return links;
}

function convert_time_to_minutes(time) {
  if (time.includes("h")) {
    if (time.includes("m")) {
      const match = time.match(/(\d+)\s*h\s*(\d+)\s*m/);
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    else {
      const match = time.match(/(\d+)\s*h/);
      return parseInt(match[1]) * 60;
    }
  }
  else {
    const match = time.match(/(\d+)\s*m/);
    if (match)
      return parseInt(match[1]);
    else
      return;
  }
}