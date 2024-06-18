const save_link_textareas_ids = ["link", "title", "summary", "time", "tags"];
const range_and_selector_ids = ["priority", "what_to_do"];


function collect_data_from_the_save_link_form() {
  var current_link = {};
  current_link.date_created = Date.now();

  const elements_ids = save_link_textareas_ids.concat(range_and_selector_ids);
  for (let each in elements_ids) {
    const element_id = elements_ids[each];
    current_link[element_id] = document.getElementById(element_id).value.trim();
  }

  return current_link;
}

function reset_collect_links_form_state() {
  clear_save_link_form();
  disable_save_button();
  draw_links_stats_chart_under_priority_bar("chart_total");
  draw_links_stats_chart_under_priority_bar("chart_what_to_do");
  save_link_textareas_ids.forEach((id) => {
    adjust_textarea_size(document.getElementById(id));
  });
}

function clear_save_link_form() {
  document.getElementById("tags_hint").innerHTML = "";

  save_link_textareas_ids.forEach((id) => {
    document.getElementById(id).value = "";
  });
}

function dim_range_placeholder_in_thumb_proximity(priority) {
  if (!priority)  // initial start of the event listener
    priority = document.getElementById("priority").value;

  const priority_placeholder_element = document.getElementById("priority_placeholder");
  if (priority < 26)  // the length of "Set priority" placeholder
    priority_placeholder_element.style.color = '#585c5f70';
  else
    priority_placeholder_element.style.color = '#585c5fff';
}

function adjust_textarea_size(element) {  // https://stackoverflow.com/questions/995168/textarea-to-resize-based-on-content-length
  element.style.height = "1px";
  element.style.height = (element.scrollHeight) + "px";
}

function shirk_textareas_if_necessary(element) {
  if (["link", "title", "summary"].includes(element.id))
    adjust_textarea_size(element);
}

function hide_fields_if_necessary(element) {
  if (element.value == "tool" || element.value == "course") {
    document.getElementById("priority").style.display = 'none';
    document.getElementById("priority_placeholder").style.display = 'none';
    document.getElementById("chart_total").style.display = 'none';
    document.getElementById("chart_what_to_do").style.display = 'none';
    document.getElementById("time").style.display = 'none';
    document.getElementById("what_to_do").classList.add("all-around-border-radius");
    document.getElementById("tags").focus();
  }
  else {
    document.getElementById("priority").style.display = '';
    document.getElementById("priority_placeholder").style.display = '';
    document.getElementById("chart_total").style.display = '';
    document.getElementById("chart_what_to_do").style.display = '';
    document.getElementById("time").style.display = '';
    document.getElementById("what_to_do").classList.remove("all-around-border-radius");
    document.getElementById("time").focus();
  }
}


function what_to_do_on_textareas_content_change(event) {
  shirk_textareas_if_necessary(event.target);
  enable_button_on_link_value_only();
  enable_tags_hint_on_any_value_only();
  suggest_tags();
  suggest_what_to_do();
}


function enable_collect_links() {
  enable_collect_links_listeners();
  draw_links_stats_chart_under_priority_bar("chart_total");
  draw_links_stats_chart_under_priority_bar("chart_what_to_do");

  fill_stats_what_to_do_for_links();
}
