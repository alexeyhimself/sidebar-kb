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
