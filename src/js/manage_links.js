function draw_links_placeholder() {
  return `<p id="links_placeholder"><b>You have no saved links yet.</b><br>Collect some &mdash; they will appear 👍</p>`;
}
function draw_links_error_message() {
  return `<p id="links_placeholder"><span style="font-size: 2em;">😲</span><br><b>Something went wrong...</b><br>Please <a href="#" id="copy_error_message_to_clipboard">click here to copy an error message to clipboard</a> and <a href="mailto:alexeyhimself@gmail.com">let us know</a></p>`;
}

function draw_links() {
  let links_html = '';
  try {
    const links = load_links_from_local_storage();

    if (links.length == 0)
      links_html = draw_links_placeholder();
    else
      links_html = draw_existing_links(links);

    if (links.length > 10) {
      document.getElementById("number_of_links").innerHTML = links.length;
      document.getElementById("links_export").style.display = '';
    }
    document.getElementById("links_area").innerHTML = links_html;
  } catch (error) {
    console.error(error);
    links_html = draw_links_error_message();
    document.getElementById("links_area").innerHTML = links_html;
    enable_copy_error_message_to_clipboard_listener("copy_error_message_to_clipboard", error);
  }
}

function draw_existing_links(links) {
  let links_html = '';
  links.forEach((item) => {
    if (!item.title)
      item.title = item.link;
    links_html += `<p><a href="${item.link}" target="_blank">${item.title}</a>`;

    if (item.time || item.importance || item.tags)
      links_html += '<br>';

    if (item.time)
      links_html += `${item.what_to_do} time: ${item.time}, `;
    if (item.importance)
      links_html += `importance: ${item.importance}, `;
    if (item.tags)
      links_html += `tags: ${item.tags}`;

    links_html += '</p>';
  });

  return links_html;
}

function load_links_from_local_storage() {
  let links = localStorage.getItem("links") || "[]";
      links = JSON.parse(links);
      links.sort(sort_dicts_by_multiple_values("-importance", "-date_created"));
  return links;
}

function enable_copy_error_message_to_clipboard_listener(element_id, error_message) {
  var element = document.getElementById(element_id);
  element.addEventListener('click', function (event) {
    navigator.clipboard.writeText(error_message);
  });
}

function enable_manage_links() {
  enable_buttons_listeners({
    "find-tab": draw_links,
    "links_export": download_as_csv,
  });
}
