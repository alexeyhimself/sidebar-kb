function enable_textareas_listeners(elements_ids) {
  for (let i in elements_ids) {
    const element_id = elements_ids[i];

    var element = document.getElementById(element_id);
    element.addEventListener('drop', handler);
    element.addEventListener('keyup', handler);
    element.addEventListener('change', handler);
    element.addEventListener('input', handler);
    element.addEventListener('oninput', handler);
    element.addEventListener('dblclick', handler);

    function handler(event) {
      //current_link[element_id] = event.dataTransfer.getData('text');
      console.log(1)
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

function count_words_stats(words_list) {
  result = {};
  words_list.forEach((word) => {
    word = word.toLowerCase();
    if (word in result)
      result[word] += 1;
    else
      result[word] = 1;
  });
  return result;
}

function enable_side_panel_dblclick_listener() {
  var element = document.getElementById("link");
  element.addEventListener('dblclick', async function (event) {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

    let page_object = await chrome.scripting.executeScript({
      target: {tabId : tab.id},
      func: () => {
        const words_list = document.body.innerText.replace(/(?:\r\n|\r|\n|:|%|\.|,|;|\?|!|'|’|\(|\)|\[|\]|0|1|2|3|4|5|6|7|8|9)/g, ' ').trim().split(/\s+/);
        return {"title": document.title, "url": document.location.href, "words_list": words_list};
      },
    });
    page_object = page_object[0].result;

    words_on_page = count_words_stats(page_object.words_list);

    suggest_tags(words_on_page);

    let link = document.getElementById("link");
    link.value = page_object.url;
    let title = document.getElementById("title")
    title.value = page_object.title;
    let time = document.getElementById("time")
    time.value = parseInt(page_object.words_list.length / 220) + 'm';  // let 220 - an avg words/minute reading speed

    adjust_textarea_size(link);
    adjust_textarea_size(title);
    suggest_what_to_do(link.value);
  });
}

function enable_chrome_runtime_listeners() {
  chrome.runtime.onMessage.addListener((message, sender) => {
    // The callback for runtime.onMessage must return falsy if we're not sending a response
    (async () => {
      if (message.type == 'context_menu_call') {
        document.getElementById("link").value = message.link;
        document.getElementById("title").value = message.title;
        document.getElementById("save").classList.add("context_menu_call");

        document.getElementById("link").dispatchEvent(new InputEvent("input")); //  https://github.com/w3c/input-events/issues/105
      }
    })();
  });
}

function enable_collect_links_listeners() {
  enable_textareas_listeners(collect_links_textareas_ids);
  enable_buttons_listeners({
    "save": save_link
  });
  enable_range_listener("priority");
  enable_selector_listener("what_to_do");
  enable_side_panel_dblclick_listener();

  enable_chrome_runtime_listeners();
}
