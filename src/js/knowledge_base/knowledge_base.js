function draw_kb_placeholder() {
  return `<p id="kb_placeholder"><b>No links in a Knowledge Base yet.</b></p><p style="text-align: center; margin: 0 5%;">Use "Move to Knowledge Base" option in "Queue to learn" to move links here.</p>`;
}
function draw_kb_error_message() {
  return `<p id="kb_placeholder"><span style="font-size: 2em;">😲</span><br><b>Something went wrong...</b><br>Please <a href="#" id="copy_error_message_to_clipboard">click here</a> to copy an error message to clipboard and <a href="mailto:alexeyhimself@gmail.com">let us know</a></p>`;
}


function draw_link_in_kb_tab(item, what_to_do) {
  let links_html = '';

  if (!item.title)
    item.title = item.link;
  links_html += '<div class="queue-link">';

  if (item.time)
    links_html += `<span class="badge bg-warning text-dark">${item.time.replace('m', ' min').replace('h', ' hour ')}</span>`;
  else {
    if (!no_time_what_to_do.includes(item.what_to_do))
      links_html += `<span class="badge bg-warning text-dark">time not set</span>`;
  }

  if (["undefined", undefined, ""].includes(item.what_to_do))
    links_html += ` <span class="badge bg-secondary">type not set</span>`;
  else
    links_html += ` <span class="badge bg-secondary">${item.what_to_do}</span>`;

  const hostname = get_hostname(item.link);
  links_html += ` <span class="hostname">${hostname}</span> <a class="queue-link-a" href="${item.link}" target="_blank">${item.title.trim()}</a><!--&nbsp;&nbsp;| <a href="#" data-url="${item.link}" class="edit_in_kb"--><!--i class="bi bi-pencil"></i--><!--img src="/images/pencil.svg" style="height: 16px; padding-right: 0px; padding-bottom: 2px;">&nbsp;Edit...</a-->`;
  if (item.notes) {
    links_html += `<span><br><b>Notes: </b> ${item.notes.replace(/\n/g, '<br>')}</span>`;
  }
  if (item.tags) {
    links_html += `<span style="margin-top: 20px;"><br><b>Tags: </b> ${item.tags}</span>`;
  }
  links_html += `<div class="btn-group queue-link-menu" style="float: inline-end; position: relative; top: 10px; width: auto;"> \
    <button type="button" class="btn btn-light dropdown-toggle dropdown-toggle-split- queue-link-button" data-bs-toggle="dropdown" aria-expanded="false" style="padding-: 6px;"> \
      <!--span class="visually-hidden">Toggle Dropdown</span--> \
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
      </svg>
    </button> \
    <ul class="dropdown-menu"> \
      <li><a class="dropdown-item edit_in_kb" href="#" data-url="${item.link}">Edit...</a></li> \
      <li><a class="dropdown-item delete_from_kb" href="#" data-url="${item.link}" data-reason="neutral">Delete</a></li> \
    </ul> \
  </div>`;

  links_html += '</div>';
  return links_html;
}

function draw_existing_links_in_kb_tab(links) {
  let links_html = '';
  links.forEach((link) => {
    links_html += draw_link_in_kb_tab(link);
  });
  return links_html;
}

function draw_links_in_kb_tab(links, no_links_callback) {
  let kb_area_element = document.getElementById("kb_area");
  try {
    if (!links)
      links = load_links_from("kb");

    if (links.length == 0) {
      if (no_links_callback)
        kb_area_element.innerHTML = no_links_callback();
      else
        kb_area_element.innerHTML = draw_kb_placeholder();
    }
    else
      kb_area_element.innerHTML = draw_existing_links_in_kb_tab(links);

  } catch (error) {
    console.error(error);
    kb_area_element.innerHTML = draw_kb_error_message();
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function get_link_from_kb(url) {
  let links = load_links_from_local_storage("kb");
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.link == url) {
      return link;
    }
  }
}

function enable_edit_in_kb_listeners() {
  document.querySelectorAll(".edit_in_kb").forEach((element) => {
    element.addEventListener('click', function (event) {
      const url = event.target.getAttribute("data-url");
      open_empty_collect_form();
      show_delete_button();
      const save_element = document.getElementById("save");
      save_element.classList.remove("context_menu_call");  // clean if left from unsaved tab
      save_element.dataset.source = "kb";

      // adjust_if_link_already_exists(link)
      const link = get_link_from_kb(url);
      all_input_elements_ids.forEach((element_id) => {
        let element = document.getElementById(element_id);
        if (link[element_id]) {
          element.value = link[element_id];
        }
      });

      suggest_tags({"link": url, "title": link.title});
      bring_form_to_active_state();
      shirk_textareas_to_content();
      //show_toast("Link has been updated");
    });
  });
}

function delete_link_from_kb(url) {
  let links = load_links_from_local_storage("kb");
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.link == url) {
      links.splice(i, 1);
      break;
    }
  }
  save_items_into_storage(links, "kb");
}

function enable_delete_from_kb_listeners() {
  document.querySelectorAll(".delete_from_kb").forEach((element) => {
    element.addEventListener('click', async function (event) {
      let url = event.target.dataset.url; // queue
      if (!url)
        url = document.getElementById("link").value; // form
      const reason = event.target.dataset.reason;
      const link = get_link_from_kb(url);
      link["reason"] = reason;
      save_link_to(link, "deleted");
      delete_link_from_kb(url);
      what_to_do_on_filter_change();
      show_toast("Link has been deleted");
      //const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      //if (tab.url == url)
      //  chrome.tabs.remove(tab.id, function() { });
    });
  });
}