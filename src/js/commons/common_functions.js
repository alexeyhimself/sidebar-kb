function load_links_from_local_storage() {
  let links = localStorage.getItem("links") || "[]";
  return JSON.parse(links);
}

function load_links_from_local_storage_sorted_by() {
  let links = load_links_from_local_storage();
  return links.sort(sort_dicts_by_multiple_values("-priority", "-date_created"));
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