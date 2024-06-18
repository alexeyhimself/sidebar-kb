const collect_links_textareas_ids = ["link", "title", "summary", "time", "tags"];
const all_input_elements_ids = collect_links_textareas_ids.concat(["priority", "what_to_do"]);


function collect_data_from_the_save_link_form() {
  var current_link = {};
  current_link.date_created = Date.now();

  for (let i in all_input_elements_ids) {
    const element_id = all_input_elements_ids[i];
    current_link[element_id] = document.getElementById(element_id).value.trim();
  }
  return current_link;
}

function reset_collect_links_form_state_after_save() {
  disable_save_button();
  clear_save_link_form();
  draw_links_stats_chart_under_priority_bar("chart_total");
  draw_links_stats_chart_under_priority_bar("chart_what_to_do");
}

function clear_save_link_form() {
  collect_links_textareas_ids.forEach((id) => {
    document.getElementById(id).value = "";
    adjust_textarea_size(document.getElementById(id));
  });
}

function dim_range_placeholder_in_thumb_proximity(priority) {
  if (!priority)  // initial start of the event listener
    priority = document.getElementById("priority").value;

  if (priority < 26)  // the length of "Set priority" placeholder
    document.getElementById("priority_placeholder").style.color = '#585c5f70';
  else
    document.getElementById("priority_placeholder").style.color = '#585c5fff';
}

function hide_fields_if_necessary(element) {
  let display;
  if (["tool", "course"].includes(element.value)) {
    display = 'none';
    document.getElementById("what_to_do").classList.add("all-around-border-radius");
    document.getElementById("tags").focus();
  }
  else {
    display = '';
    document.getElementById("what_to_do").classList.remove("all-around-border-radius");
    document.getElementById("time").focus();
  }

  document.getElementById("priority").style.display = display;
  document.getElementById("priority_placeholder").style.display = display;
  document.getElementById("chart_total").style.display = display;
  document.getElementById("chart_what_to_do").style.display = display;
  document.getElementById("time").style.display = display;
}

function what_to_do_on_textareas_content_change(event) {
  adjust_textarea_size(event.target);
  enable_button_on_link_value_only();
  enable_tags_hint_on_any_value_only();
  suggest_tags();
  //suggest_what_to_do();
}

function enable_collect_links() {
  enable_collect_links_listeners();
  draw_links_stats_chart_under_priority_bar("chart_total");
  draw_links_stats_chart_under_priority_bar("chart_what_to_do");
  fill_stats_what_to_do_for_links();
}
