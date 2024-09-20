function load_tags_from_local_storage() {
  const tags = localStorage.getItem("tags") || "{}";
  return JSON.parse(tags);
}

function update_tags_in_local_storage(new_tags) {
  if (!new_tags)
    return;

  let tags = load_tags_from_local_storage();
  let existing_tags = tags.existing || {};
  let most_recent_tags = tags.most_recent || [];

  new_tags = new_tags.split(",");
  for (let i in new_tags) {
    const new_tag = new_tags[i].trim().replace(/(?:\r\n|\r|\n)/g, '');
    if (!new_tag)
      continue;

    // recalculate existing tags stats
    if (new_tag in existing_tags)
      existing_tags[new_tag] += 1;
    else
      existing_tags[new_tag] = 1;

    // if new_tag exists in tags.most_recent then refresh it's position
    var new_tag_index = most_recent_tags.indexOf(new_tag);
    if (new_tag_index > -1)
      most_recent_tags.splice(new_tag_index, 1);

    most_recent_tags.push(new_tag)
    most_recent_tags = most_recent_tags.slice(-100);  // keep the list length fixed
  }

  tags = {"existing": existing_tags, "most_recent": most_recent_tags};
  save_items_into_storage(tags, "tags");
}

function compose_tags(words_on_page) {
  let tags = load_tags_from_local_storage();

  if (!tags.existing)
    return [];

  if (words_on_page) {
    tags_existing = Object.keys(tags.existing);
    let resulting_tags = {};
    tags_existing.forEach((existing_tag) => {
      if (existing_tag in words_on_page)
        resulting_tags[existing_tag] = words_on_page[existing_tag];
    })
    let composed_tags = Object.keys(resulting_tags);
    if (composed_tags.length != 0) {
      let result = [];
      tags.most_recent.reverse().forEach((most_recent_tag) => {
        if (composed_tags.includes(most_recent_tag))
          result.push(most_recent_tag);
      })
      return result.slice(0, 15);
    }
    else
      return tags.most_recent.reverse().slice(0, 15);
  }
  else {
    /*
    let save_element = document.getElementById("save");
    if (save_element.classList.contains("auto_fill")) {
      //console.log("auto-fill");
      return [];
    }
    */

    const most_recent_tags = tags.most_recent.reverse();
    return most_recent_tags.slice(0, 10);
  }

  setTimeout(() => {
    //... suggest content-based tags
  }, 100);
  //console.log(most_used_tags, most_recent_tags);
  /* 
    based on input:
    if domain exists, get most used tags from there
    if keywords in title / summary
  */
}

function draw_tags_hint(tags) {
  let most_used_tags = sort_dict_by_value_desc(load_tags_from_local_storage().existing);
  most_used_tags = Object.keys(most_used_tags).slice(0, 15);

  let tags_hint = '';
  tags.forEach((tag) => {
    if (most_used_tags.includes(tag))
      tags_hint += `<a href="#" class="suggested_tag"><b>${tag}</b></a>, `;
    else
      tags_hint += `<a href="#" class="suggested_tag">${tag}</a>, `;
  });
  tags_hint = tags_hint.slice(0, -2);
  const tags_hint_element = document.getElementById("tags_hint_content");
  tags_hint_element.innerHTML = tags_hint;
  //tags_hint_element.style.display = 'block';
  enable_tags_hint_listeners();

  show_tags();
}

function show_wait_tags() {
  document.getElementById("tags_hint").style.display = "block";
  document.getElementById("tags_hint_content").style.display = 'none';
  document.getElementById("dots").style.display = '';
}
function show_tags() {
  document.getElementById("tags_hint_content").style.display = 'contents';
  document.getElementById("dots").style.display = 'none';
}
function hide_tags() {
  //console.log("tags hidden")
  document.getElementById("tags_hint").style.display = "none";
  //document.getElementById("tags_hint_content").style.display = 'none';
  //document.getElementById("dots").style.display = '';
}

async function suggest_tags(page_object) {
  if (!page_object)
    return;

  show_wait_tags();
  await generate_tags(page_object);
  show_tags();
}

async function generate_tags(page_object) {
  const ai_tags = await ask_ai(page_object);
  const non_ai_tags = compose_tags(page_object.words_on_page);

  let tags = [...new Set(ai_tags.concat(non_ai_tags))];
  //console.log(tags)
  if (tags.length == 0) {
    hide_tags();
    return;
  }
  else if (tags.length < 10) {
    tags = [...new Set(tags.concat(compose_tags({})))];
  }
  //console.log(tags)
  draw_tags_hint(tags);
}

function enable_tags_hint_on_any_value_only() {
  return;

  setTimeout(() => {
    if (document.getElementById("link").value || document.getElementById("title").value || document.getElementById("tags").value)
      document.getElementById("tags_hint").style.display = 'block';
    else
      document.getElementById("tags_hint").style.display = 'none';
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
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

      adjust_textarea_size(tags_element);
    });
  });
}
