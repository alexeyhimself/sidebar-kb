function enable_save_button() {
  document.getElementById("save").classList.remove("disabled");
}
function disable_save_button() {
  document.getElementById("save").classList.add("disabled");
}
function enable_button_on_link_value_only() {
  setTimeout(() => {
    const link = document.getElementById("link").value;
    if(link) {
      enable_save_button();
      suggest_what_to_do(link);
    }
    else
      disable_save_button();
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
}

function save_current_link() {
  save_data_to_local_storage(collect_data_from_the_save_link_form());
  reset_collect_links_form_state();
}

function save_data_to_local_storage(what_to_save) {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);

  links.push(what_to_save);
  localStorage.setItem("links", JSON.stringify(links));
  update_tags_in_local_storage(what_to_save.tags);
}
