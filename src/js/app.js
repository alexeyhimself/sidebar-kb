// providing backward compatibilty with existing user's data
function fix_data() {
  const links = load_links_from_local_storage().reverse();  // REVERSE TIME ORDER

  let new_links = [];
  for (let i in links) {
    let link = links[i];

    // renamed fields
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
      delete link["urgency"];
      delete link["priority"];
      delete link["time"];
    }
    if ("summary" in link) {
      link["notes"] = link.summary;
      delete link["summary"];
    }
    if (!link["time_minutes"])
      link = add_time_in_minutes_to_link(link);
    if (link.priority)
      link["priority"] = parseInt(link.priority);
    if (![99, 50, 1, undefined].includes(link.priority)) {
      if (link.priority <= 33)
        link["priority"] = 1;
      else if (link.priority <= 66)
        link["priority"] = 50;
      else if (link.priority <= 100)
        link["priority"] = 99;
    }
    if (link.what_to_do == "undefined")
      link["what_to_do"] = undefined;
    if (!link.date_created)
      link["date_created"] = Date.now();
    if (!link.date_updated)
      link["date_updated"] = link["date_created"];

    new_links.push(link);
  }
 
  // remove duplicates assuming latest version is more valid
  let urls = [];
  let new_unique_links = [];
  new_links.forEach((link) => {
    if (urls.includes(link.link))
        ;
    else {
      urls.push(link.link);
      new_unique_links.push(link);
    }
  });

  localStorage.setItem("links", JSON.stringify(new_unique_links.reverse()));  // REVERSE BACK
}

var toast;

window.onload = function() {
  fix_data();

  const toast_el = document.getElementById('toast');
  toast = new bootstrap.Toast(toast_el);

  check_available_ai_platforms();

  enable_collect_links();
  enable_manage_links();
}
