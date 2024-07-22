function draw_kb_placeholder() {
  return `<p id="kb_placeholder"><b>You have nothing saved in your <br>Knowledge Base yet.</b><br>Need some guidance for the user what they can do in this case, how they can fix the situation.</p>`;
}
function draw_kb_error_message() {
  return `<p id="kb_placeholder"><span style="font-size: 2em;">😲</span><br><b>Something went wrong...</b><br>Please <a href="#" id="copy_error_message_to_clipboard">click here</a> to copy an error message to clipboard and <a href="mailto:alexeyhimself@gmail.com">let us know</a></p>`;
}

function draw_existing_links_in_kb_tab(links) {
  let links_html = '';
  links.forEach((item) => {
    if (!item.title)
      item.title = item.link;
    links_html += `<p style="margin-bottom: 20px;"><a href="${item.link}" target="_blank">${item.title}</a>`;

    if (item.what_to_do)
      links_html += `<br><b>${item.what_to_do}</b>`;
    if (item.time)
      links_html += `<br><b>time:</b> ${item.time}`;
    //if (item.priority)
    //  links_html += `priority: ${item.priority}`;
    if (item.tags)
      links_html += `<br><b>tags:</b> ${item.tags}`;
    if (item.notes)
      links_html += `<br><b>notes:</b> ${item.notes.replace(/\n/g, '<br>')}`;

    links_html += '</p>';
  });

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

  } catch (error) {
    console.error(error);
    document.getElementById("kb_area").innerHTML = draw_kb_error_message();
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function enable_knowledge_base() {
  enable_buttons_listeners({
    "kb-tab": draw_links_in_kb_tab,
  });
}

