function draw_kb_placeholder() {
  return `<p id="kb_placeholder"><b>You have nothing saved in your <br>Knowledge Base yet.</b></p>`;
}
function draw_kb_error_message() {
  return `<p id="kb_placeholder"><span style="font-size: 2em;">😲</span><br><b>Something went wrong...</b><br>Please <a href="#" id="copy_error_message_to_clipboard">click here</a> to copy an error message to clipboard and <a href="mailto:alexeyhimself@gmail.com">let us know</a></p>`;
}


function draw_link_in_kb_tab(item, j, what_to_do) {
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

  if (what_to_do == "others" || what_to_do == undefined) {
    if (item.what_to_do == "undefined" || item.what_to_do === undefined)
      links_html += ` <span class="badge bg-secondary">type not set</span>`;
    else
      links_html += ` <span class="badge bg-secondary">${item.what_to_do}</span>`;
  }

  const hostname = get_hostname(item.link);
  links_html += ` <span class="hostname">${hostname}</span> <a class="queue-link-a" href="${item.link}" target="_blank">${item.title.trim()}</a><!--&nbsp;&nbsp;| <a href="#" data-url="${item.link}" class="edit_in_queue"--><!--i class="bi bi-pencil"></i--><!--img src="/images/pencil.svg" style="height: 16px; padding-right: 0px; padding-bottom: 2px;">&nbsp;Edit...</a-->`;
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
    <li><a class="dropdown-item edit_in_queue" href="#" data-url="${item.link}">Edit</a></li> \
  </ul> \
</div>`;

  links_html += '</div>';
  return links_html;
}

function draw_existing_links_in_kb_tab(links) {
  let links_html = ''; //`<div id="top-3-section"><p><b>Most recently saved on top:</b></p>`;
  let group_id = 1;
  let group_started = false;
  let date_created = new Date(1).toLocaleDateString('en-US');
  for (let j = 0; j < links.length; j++) {
    const item = links[j];
    
    links_html += draw_link_in_kb_tab(item, j);
    group_id = item.group_id;
  }
  links_html += '</div>';
  return links_html;
}

function draw_links_in_kb_tab(links, no_links_callback) {
  try {
    if (!links)
      links = load_links_from("kb");

    if (links.length == 0) {
      if (no_links_callback)
        document.getElementById("kb_area").innerHTML = no_links_callback();
      else
        document.getElementById("kb_area").innerHTML = draw_kb_placeholder();
    }
    else
      document.getElementById("kb_area").innerHTML = draw_existing_links_in_kb_tab(links);

    //enable_edit_in_queue_listeners();
  } catch (error) {
    console.error(error);
    document.getElementById("kb_area").innerHTML = draw_kb_error_message();
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function enable_knowledge_base() {
  //draw_links_in_kb_tab();
}

