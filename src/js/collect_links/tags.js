function load_tags_from_local_storage() {
  const tags = localStorage.getItem("tags") || "{}";
  return JSON.parse(tags);
}

function update_tags_in_local_storage(new_tags) {
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
  localStorage.setItem("tags", JSON.stringify(tags));
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
    return Object.keys(resulting_tags);
  }
  else {
    const most_recent_tags = tags.most_recent.reverse();
    return most_recent_tags.slice(0, 30);
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

  let tags_hint = 'Tags hint: ';
  tags.forEach((tag) => {
    if (most_used_tags.includes(tag))
      tags_hint += `<a href="#" class="suggested_tag"><b>${tag}</b></a>, `;
    else
      tags_hint += `<a href="#" class="suggested_tag">${tag}</a>, `;
  });
  tags_hint = tags_hint.slice(0, -2)
  document.getElementById("tags_hint").innerHTML = tags_hint;
  enable_tags_hint_listeners();
}

function suggest_tags(words_on_page) {
  const tags = compose_tags(words_on_page);
  if (tags.length == 0)
    return;

  draw_tags_hint(tags);
}

function enable_tags_hint_on_any_value_only() {
  setTimeout(() => {
    if (document.getElementById("link").value || document.getElementById("title").value || document.getElementById("tags").value)
      document.getElementById("tags_hint").style.display = '';
    else
      document.getElementById("tags_hint").style.display = 'none';
  }, 100);  // a bit wait because drag&drop events pass faster than the DOM update
}
