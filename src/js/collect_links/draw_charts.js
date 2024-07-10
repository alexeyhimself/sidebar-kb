var chart_total_max = 0;
var chart_what_to_do_max = 0;

function calculate_links_stats_for_priority_bar(chart_id, what_to_do, links) {
  let stats = {};
  let max = 0;
  for (let i in links) {
    let link = links[i];
    if (!link.priority)
      continue;

    if (what_to_do && chart_id == "chart_what_to_do") {
      if (link.what_to_do != what_to_do)
        continue;
    }

    if (!stats[link.priority])
      stats[link.priority] = 1;
    else
      stats[link.priority] += 1;

    if (stats[link.priority] > max)
      max = stats[link.priority];
  }
  
  if (chart_id == "chart_what_to_do")
    chart_what_to_do_max = max;
  else
    chart_total_max = max;

  return stats;
}
function adjust_links_stats_chart_height_if_needed(number_of_saved_links) {
  if (number_of_saved_links < 1000) {
    document.getElementById("priority").style.height = "36px";
    document.getElementById("priority").style.paddingBottom = "5px";
    document.getElementById("priority_placeholder").style.top = "-74px";
    return false;
  }
  else {
    document.getElementById("priority").style.height = "60px";
    document.getElementById("priority_placeholder").style.top = "-98px";
    document.getElementById("priority").style.paddingBottom = "30px";
    return true;
  }
}
function draw_links_stats_chart_under_priority_bar(chart_id, what_to_do) {
  const links = load_links_from_local_storage();

  //const should_we_draw_the_chart = adjust_links_stats_chart_height_if_needed(links.length);
  if (!should_we_draw_the_chart)
    return;

  if (!what_to_do)
    what_to_do = document.getElementById("what_to_do").value;

  const stats = calculate_links_stats_for_priority_bar(chart_id, what_to_do, links);

  let content = '';
  for (let i = 0; i <= 100; i+=2) {
    let items = stats[i];
    let items2 = stats[i+1];
    let items3 = items || 0;
    if (items2)
      items3 += items2;

    if (items3)
      content += `<div style="height: ${items3 * 100 / (chart_total_max * 1.5)}%;" class="${chart_id}"></div>`;
    else
      content += `<div style="height: 1px;" class="${chart_id}"></div>`;
  }
  document.getElementById(chart_id).innerHTML = content;
}