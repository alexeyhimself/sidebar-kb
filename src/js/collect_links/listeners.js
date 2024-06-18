function enable_textareas_listeners(elements_ids) {
  for (let i in elements_ids) {
    const element_id = elements_ids[i];

    var element = document.getElementById(element_id);
    element.addEventListener('drop', handler);
    element.addEventListener('keyup', handler);
    element.addEventListener('dblclick', handler);

    function handler(event) {
      //current_link[element_id] = event.dataTransfer.getData('text');
      what_to_do_on_textareas_content_change(event);
    }
  }
}

function enable_buttons_listeners(buttons) {
  for (let button_id in buttons) { 
    var element = document.getElementById(button_id);
    element.addEventListener('click', function (event) {
      buttons[button_id]();
    });
  }
}

function enable_range_listener(element_id) {
  dim_range_placeholder_in_thumb_proximity();

  var element = document.getElementById(element_id);
  element.addEventListener('change', function (event) {
    const priority = parseInt(this.value);
    dim_range_placeholder_in_thumb_proximity(priority);
  });
}

function enable_tags_hint_listeners() {
  let elements = document.querySelectorAll(".suggested_tag");
  elements.forEach(function(element) {
    element.addEventListener("click", function(event) {
      let tags_element = document.getElementById("tags");
      let existing_tags = tags_element.value.trim();

      if (!existing_tags)
        tags_element.value = element.innerText;
      else if (existing_tags.slice(-1) == ',')
        tags_element.value = existing_tags + ` ${element.innerText}`;
      else
        tags_element.value = existing_tags + `, ${element.innerText}`;
    });
  });
}

function enable_selector_listener(element_id) {
  var element = document.getElementById(element_id);  
  element.addEventListener('change', function (event) {
    hide_fields_if_necessary(event.target);
    draw_links_stats_chart_under_priority_bar("chart_what_to_do", event.target.value);
  });
}

function enable_side_panel_dblclick_listener() {
  var element = document.getElementById("link");
  element.addEventListener('dblclick', async function (event) {
    /*
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      const tab = tabs[0];
      let link = document.getElementById("link");
      link.value = tab.url;
      let title = document.getElementById("title")
      title.value = tab.title;
      adjust_textarea_size(link);
      adjust_textarea_size(title);
    */
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    const tabId = tab.id;

      let a = await chrome.scripting
        .executeScript({
          target: {tabId : tabId},
          func: () => {
            const words = document.body.innerText.replace(/(?:\r\n|\r|\n)/g, ' ').trim().split(/\s+/).length;
            return {"title": document.title, "url": document.location.href, "words": words};
          },
        });
        //console.log(a);
        a = a[0].result;
      let link = document.getElementById("link");
      link.value = a.url;
      let title = document.getElementById("title")
      title.value = a.title;
      let time = document.getElementById("time")
      time.value = parseInt(a.words / 220) + 'm';
      adjust_textarea_size(link);
      adjust_textarea_size(title);
      suggest_what_to_do(link.value);
    });
  //});
}

function enable_collect_links_listeners() {
  enable_textareas_listeners(save_link_textareas_ids);
  enable_buttons_listeners({
    "save": save_current_link
  });
  enable_range_listener("priority");
  enable_selector_listener("what_to_do");
  enable_side_panel_dblclick_listener();
}
