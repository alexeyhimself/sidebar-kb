function draw_kb_placeholder() {
  document.getElementById("kb_area").innerHTML = `<p id="kb_placeholder"><b>You have nothing saved in your <br>Knowledge Base yet.</b><br><br>Need an guidance for the user what they can do in this case, how to fix situation.</p>`;
}
function draw_kb_error_message() {
  document.getElementById("kb_area").innerHTML = `<p id="kb_placeholder"><span style="font-size: 2em;">😲</span><br><b>Something went wrong...</b><br>Please <a href="#" id="copy_error_message_to_clipboard">click here</a> to copy an error message to clipboard and <a href="mailto:alexeyhimself@gmail.com">let us know</a></p>`;
}

function enable_knowledge_base() {
  enable_buttons_listeners({
    "kb-tab": draw_kb_placeholder,
  });
}
