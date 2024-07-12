const collect_links_textareas_ids = ["link", "title", "notes", "time", "tags"];
const all_input_elements_ids = collect_links_textareas_ids.concat(["priority", "what_to_do"]);

function bring_form_to_idle_state() {
  document.getElementById("save").classList.add("disabled");
  document.getElementById("priority").style.setProperty('--sliderColor', "#6ba2ff");
  document.getElementById("what_to_do").style.color = "gray";
}
function bring_form_to_active_state() {
  document.getElementById("save").classList.remove("disabled");
  document.getElementById("priority").style.setProperty('--sliderColor', "#0075ff");
  document.getElementById("what_to_do").style.color = "black";
}

function collect_data_from_the_save_link_form() {
  var current_link = {};
  current_link.date_created = Date.now();

  for (let i in all_input_elements_ids) {
    const element_id = all_input_elements_ids[i];
    current_link[element_id] = document.getElementById(element_id).value.trim().replace(/(?:\r\n|\r|\n)/g, '');
  }
  return current_link;
}

function reset_collect_links_form_state_after_save() {
  bring_form_to_idle_state();
  clear_save_link_form();
  //draw_links_stats_chart_under_priority_bar("chart_total");
  //draw_links_stats_chart_under_priority_bar("chart_what_to_do");
}

function clear_save_link_form() {
  collect_links_textareas_ids.forEach((id) => {
    document.getElementById(id).value = "";
    adjust_textarea_size(document.getElementById(id));
  });
}

/*
function dim_range_placeholder_in_thumb_proximity(priority) {
  if (!priority)  // initial start of the event listener
    priority = document.getElementById("priority").value;

  if (priority < 63)  // the length of "Set priority" placeholder
    document.getElementById("priority_placeholder").style.color = '#585c5f70';
  else
    document.getElementById("priority_placeholder").style.color = '#585c5fff';
}
*/

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
    // document.getElementById("time").focus();  // when try to edit URL this breaks UX
  }

  document.getElementById("priority").style.display = display;
  //document.getElementById("priority_placeholder").style.display = display;
  //document.getElementById("chart_total").style.display = display;
  //document.getElementById("chart_what_to_do").style.display = display;
  document.getElementById("time").style.display = display;
}

function link_already_exists(link) {
  const links = load_links_from_local_storage();
  for (let i = 0; i < links.length; i++) {
    if (links[i].link == link)
      return links[i];
  }
  return false;
}

function fill_the_collect_links_form_with_existing_data(link) {
  all_input_elements_ids.forEach((element_id) => {
    document.getElementById(element_id).value = link[element_id];
  });
}

function what_to_do_on_textareas_content_change(event) {
  adjust_textarea_size(event.target);
  enable_button_on_link_value_only();
  enable_tags_hint_on_any_value_only();

  if (!document.getElementById("save").classList.contains("context_menu_call"))
    suggest_tags();

  if (event.target.id == "link") {
    setTimeout(() => {
      const link = event.target.value;
      const existing_link = link_already_exists(link);
      if (existing_link) {
        fill_the_collect_links_form_with_existing_data(existing_link);
        document.getElementById("save").innerText = "Update existing link";
        document.getElementById("save").classList.add("btn-warning");
      }
      else {
        document.getElementById("save").innerText = "Add to Queue";
        document.getElementById("save").classList.remove("btn-warning");
      }

      suggest_what_to_do(link);

    }, 200);  // a bit wait because drag&drop events pass faster than the DOM update
  }
}

function enable_collect_links() {
  enable_collect_links_listeners();
  //draw_links_stats_chart_under_priority_bar("chart_total");
  //draw_links_stats_chart_under_priority_bar("chart_what_to_do");
  fill_stats_of_what_to_do_for_links();
}
