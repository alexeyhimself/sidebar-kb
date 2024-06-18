function sort_dict_by_value_desc(dict) {  // https://www.geeksforgeeks.org/how-to-sort-a-dictionary-by-value-in-javascript/
  return Object.keys(dict)
    .sort((a, b) => dict[b] - dict[a])
    .reduce((acc, key) => {
      acc[key] = dict[key];
      return acc;
    }, {});
}
function sort_dicts_by_value(property) {  // https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
  var sortOrder = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b) {
    if (!a[property] || !b[property])  // my change: if undefined, move them to the end of list
      return sortOrder;
    /* next line works with strings and numbers, 
     * and you may want to customize it to your needs
     */
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}
function sort_dicts_by_multiple_values() {
  var props = arguments;
  return function (obj1, obj2) {
    var i = 0, result = 0, numberOfProperties = props.length;
    while(result === 0 && i < numberOfProperties) {
      result = sort_dicts_by_value(props[i])(obj1, obj2);
      i++;
    }
    return result;
  }
}

function convert_array_of_objects_to_csv(array_of_objects) {  // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
  let array_of_arrays = [["link", "title", "summary", "time", "tags", "priority", "what_to_do"]];
  array_of_objects.forEach((obj) => {
    array_of_arrays.push([obj.link, obj.title, obj.summary, obj.time, obj.tags, obj.priority, obj.what_to_do]);
  });
  return array_of_arrays.map(row =>
    row
    .map(String)  // convert every value to String
    .map(v => v.replaceAll('"', '""'))  // escape double quotes
    .map(v => `"${v}"`)  // quote it
    .join(',')  // comma-separated
  ).join('\r\n');  // rows starting on new lines
}
function download_as_file(content) {
  var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);

  // Create a link to download it
  var pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', 'exported_links.csv');
  pom.click();
}
function download_as_csv() {
  const links = load_links_from_local_storage_sorted_by();
  const csv = convert_array_of_objects_to_csv(links);
  download_as_file(csv);
}

function get_hostname(link) {  // https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
  const { hostname } = new URL(link);
  return hostname.replace(/^www\./g, '');  // remove starting "www."
}

function adjust_textarea_size(element) {  // https://stackoverflow.com/questions/995168/textarea-to-resize-based-on-content-length
  element.style.height = "1px";
  element.style.height = (element.scrollHeight) + "px";
}
