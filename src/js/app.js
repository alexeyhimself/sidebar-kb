function fix_data() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);

  let new_links = [];
  for (let i in links) {
    let link = links[i];

    if ("priority" in link)
      return;

    if ("importance" in link) {
      link["priority"] = link.importance;
      delete link["importance"];
    }
    if ("urgency" in link) {
      link["priority"] = link.urgency;
      delete link["urgency"];
    }
    if (["course", "tool"].includes(link["what_to_do"])) {
      delete link["importance"];
      delete link["priority"];
      delete link["time"];
    }

    new_links.push(link);
  }

  localStorage.setItem("links", JSON.stringify(new_links));
}

window.onload = function() {
  fix_data();

  enable_collect_links();
  enable_manage_links();
}
