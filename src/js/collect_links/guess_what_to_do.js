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
  
  if (["youtube.com", "youtu.be"].includes(hostname))
    return "watch";

  return "read";
}

function suggest_what_to_do(link) {
  const what_to_do = guess_what_to_do_by_link(link);
  const what_to_do_element = document.getElementById("what_to_do");
  what_to_do_element.value = what_to_do;
  update_form_after_what_to_do_change(what_to_do_element);
}

function update_stats_of_what_to_do_for_links(link) {
  let hostname = get_hostname(link.link);

  if (hostname in stats_of_what_to_do_for_links) {
    let what_to_dos = stats_of_what_to_do_for_links[hostname];
    if (link.what_to_do in what_to_dos)
      what_to_dos[link.what_to_do] += 1;
    else
      what_to_dos[link.what_to_do] = 1;
  }
  else {
    stats_of_what_to_do_for_links[hostname] = {};
    stats_of_what_to_do_for_links[hostname][link.what_to_do] = 1;
  }
}

function update_form_after_what_to_do_change(what_to_do_element) {
  hide_fields_if_necessary(what_to_do_element);
  draw_links_stats_chart_under_priority_bar("chart_what_to_do", what_to_do_element.value);
  enable_button_on_link_value_only();
}

function enable_selector_listener(element_id) {
  var element = document.getElementById(element_id);  
  element.addEventListener('change', function (event) {
    update_form_after_what_to_do_change(event.target);
  });
}
