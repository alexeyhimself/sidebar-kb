var stats_of_what_to_do_for_links = {};


function fill_stats_of_what_to_do_for_links() {
  load_links_from_local_storage().forEach((link) => {
    update_stats_of_what_to_do_for_links(link);
  });
}
function guess_what_to_do_by_link(link) {
  const hostname = get_hostname(link);
  if (hostname in stats_of_what_to_do_for_links) {
    let what_to_dos = stats_of_what_to_do_for_links[hostname];
    let sorted_what_to_dos = sort_dict_by_value_desc(what_to_dos);
    return Object.keys(sorted_what_to_dos)[0];
  }
  else
    return "read";
}

function suggest_what_to_do(link) {
  const what_to_do = guess_what_to_do_by_link(link);
  document.getElementById("what_to_do").value = what_to_do;
}

function update_stats_of_what_to_do_for_links(link) {
  let hostname = get_hostname(link.link);

  if (hostname in stats_of_what_to_do_for_links) {
    let what_to_dos = stats_of_what_to_do_for_links[hostname];
    if (link.what_to_do in what_to_dos)
      what_to_dos[link.what_to_do] += 1;
  }
  else {
    stats_of_what_to_do_for_links[hostname] = {};
    stats_of_what_to_do_for_links[hostname][link.what_to_do] = 1;
  }
}