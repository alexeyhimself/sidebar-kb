function draw_kb_placeholder() {
  document.getElementById("kb_area").innerHTML = `<p id="kb_placeholder"><b>You have nothing saved in your <br>Knowledge Base yet.</b><br>Need some guidance for the user what they can do in this case, how they can fix the situation.</p>`;
}
function draw_kb_error_message() {
  document.getElementById("kb_area").innerHTML = `<p id="kb_placeholder"><span style="font-size: 2em;">😲</span><br><b>Something went wrong...</b><br>Please <a href="#" id="copy_error_message_to_clipboard">click here</a> to copy an error message to clipboard and <a href="mailto:alexeyhimself@gmail.com">let us know</a></p>`;
}

function draw_links(links, no_links_callback) {
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
      document.getElementById("kb_area").innerHTML = draw_existing_links(links);

  } catch (error) {
    console.error(error);
    document.getElementById("kb_area").innerHTML = draw_kb_error_message();
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function enable_knowledge_base() {
  enable_buttons_listeners({
    "kb-tab": draw_links,
  });
}

