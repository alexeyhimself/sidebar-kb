function enable_textarea_listener(element_id, callback) {
  var element = document.getElementById(element_id);
  element.addEventListener('drop', handler);
  element.addEventListener('keyup', handler);
  element.addEventListener('change', handler);
  //element.addEventListener('input', handler);
  //element.addEventListener('oninput', handler);
  element.addEventListener('dblclick', handler);

  function handler(event) {
    callback(event);
  }
}

function enable_range_listener(element_id) {
  //dim_range_placeholder_in_thumb_proximity();

  var element = document.getElementById(element_id);
  element.addEventListener('change', function (event) {
    const priority = parseInt(this.value);
    //dim_range_placeholder_in_thumb_proximity(priority);
  });
}

async function get_data_from_active_tab(tab) {
  const page_object = await chrome.scripting.executeScript({
    target: {tabId : tab.id},
    func: () => {
      let { hostname } = new URL(document.location.href);
      hostname = hostname.replace(/^www\./g, '');  // remove starting "www."

      if (["youtube.com", "youtu.be"].includes(hostname)) {
        let time = document.getElementsByClassName('ytp-time-duration')[0].innerHTML;
        let time_list = time.split(':').reverse();
        let time_minutes = '';
        if (time_list[2])
          time_minutes += time_list[2] + 'h ';
        if (time_list[1])
          time_minutes += time_list[1] + 'm';
        
        return {
          "title": document.title,
          "link": document.location.href,
          "time": time_minutes,
        };
      }
      else {
        const words_list = document.body.innerText.replace(/(?:\r\n|\r|\n|:|%|\.|,|;|\?|!|'|’|\(|\)|\[|\]|0|1|2|3|4|5|6|7|8|9)/g, ' ').trim().split(/\s+/);

        // can't be an external function count_words_stats_for_words_list(words_list)
        words_on_page = {};
        words_list.forEach((word) => {
          word = word.toLowerCase();
          if (word in words_on_page)
            words_on_page[word] += 1;
          else
            words_on_page[word] = 1;
        });

        return {
          "title": document.title,
          "link": document.location.href,
          "words_on_page": words_on_page,
          "time": parseInt(words_list.length / 220) + 'm',  // assume 220 - an avg words/minute reading speed
        };
      }
    }
  });

  return page_object[0].result;
}

function fill_and_adjust_textareas(page_object) {
  ["link", "title", "time"].forEach((element_id) => {
    const element = document.getElementById(element_id);
    element.value = page_object[element_id];
    adjust_textarea_size(element);
  })

  document.getElementById("link").dispatchEvent(new InputEvent("input"));  //  https://github.com/w3c/input-events/issues/105  
}

async function fill_and_adjust(tab) {
  const page_object = await get_data_from_active_tab(tab);
  //open_collect_form();
  fill_and_adjust_textareas(page_object);
  suggest_what_to_do(page_object.link);
  if (page_object.words_on_page)
    suggest_tags(page_object.words_on_page);

  adjust_if_link_already_exists(page_object.link);
  let save_element = document.getElementById("save");
  save_element.classList.add("auto_fill");
}

function enable_side_panel_grab_tab_click_listener() {
  var element = document.getElementById("grab_tab");
  element.addEventListener('click', async function (event) {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    open_collect_form();
    fill_and_adjust(tab);
    //document.getElementById("choose_action").innerHTML = "Save currently opened tab";
  });
}

function enable_side_panel_dblclick_listener() {
  var element = document.getElementById("link");
  element.addEventListener('dblclick', async function (event) {
    // document.getElementById("save").classList.add("context_menu_call");
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    open_collect_form();
    fill_and_adjust(tab);
  });
}

function enable_chrome_runtime_listeners() {
  chrome.runtime.onMessage.addListener((message, sender) => {
    // The callback for runtime.onMessage must return falsy if we're not sending a response
    (async () => {
      if (message.type == 'context_menu_call') {
        document.getElementById("save").classList.add("context_menu_call");  // this is made to close tab on save
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        setTimeout(() => {
          open_collect_form();
          fill_and_adjust(tab);
        }, 2000);  // if page is loaded longer than 2s then will not work out. Need to use messaging on document ready
      }
      if (message.type == 'context_menu_already_opened_tab') {
        // document.getElementById("save").classList.add("context_menu_call");  // this is made to close tab on save
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        setTimeout(() => {
          open_collect_form();
          fill_and_adjust(tab);
        }, 0);  // if page is loaded longer than 2s then will not work out. Need to use messaging on document ready
      }
    })();
  });

  /*
  chrome.tabs.onRemoved.addListener(function(tabId, info) {
    count_tabs_in_a_window();
  });
  chrome.tabs.onCreated.addListener(function(tabId, info) {
    count_tabs_in_a_window();
  });
  */
  //chrome.webNavigation.onCompleted.addListener(function(details) {
  //  console.log(details);
  //},{});
}

function enable_radios_listener() {
  document.getElementById("priority-vs-time").addEventListener('click', function (event) {
    if (event.target && event.target.matches("input[type='radio']")) {
      what_to_do_on_filter_change();
    }
  });
}

function enable_collect_links_listeners() {
  collect_links_textareas_ids.forEach((element_id) => { 
    enable_textarea_listener(element_id, what_to_do_on_textareas_content_change);
  });
  enable_buttons_listeners({
    "save": save_link,
    //"clear": reset_form_state,
    "open_empty_collect_form": open_empty_collect_form,
    "close_collect_form": close_collect_form,
    "save_all": save_all_tabs_in_window,
  });
  enable_range_listener("priority");
  enable_selector_listener("what_to_do");
  enable_side_panel_dblclick_listener();
  enable_side_panel_grab_tab_click_listener();
  enable_radios_listener();

  enable_chrome_runtime_listeners();
}
