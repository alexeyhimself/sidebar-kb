function sort_dict_by_value_desc(dict) {  // https://www.geeksforgeeks.org/how-to-sort-a-dictionary-by-value-in-javascript/
  console.log(dict)
  return Object.keys(dict)
    .sort((a, b) => dict[b] - dict[a])
    .reduce((acc, key) => {
      acc[key] = dict[key];
      return acc;
    }, {});
}
function sort_dicts_by_value(property) {  // https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b) {
    if (!a[property] && !b[property]) {  // my change: if undefined, move them to the end of list
      return 0; //-1 * sortOrder;
    }
    else if (!a[property]) {
      return -1 * sortOrder;
    }
    else if (!b[property]) {
      return 1 * sortOrder;
    }
    /* next line works with strings and numbers */
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}
function sort_dicts_by_multiple_values() {
  var props = arguments;
  return function (obj1, obj2) {
    var i = 0, result = 0, numberOfProperties = props.length;
    while (result === 0 && i < numberOfProperties) {
      result = sort_dicts_by_value(props[i])(obj1, obj2);
      i++;
    }
    return result;
  }
}

function convert_array_of_objects_to_csv(array_of_objects) {  // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
  let array_of_arrays = [["link", "title", "notes", "time", "tags", "priority", "what_to_do", "date_created"]];
  array_of_objects.forEach((obj) => {
    array_of_arrays.push([obj.link, obj.title, obj.notes, obj.time, obj.tags, obj.priority, obj.what_to_do, obj.date_created]);
  });
  return array_of_arrays.map(row =>
    row
    .map(String)  // convert every value to String
    .map(v => v.replaceAll('"', '""'))  // escape double quotes
    .map(v => `"${v}"`)  // quote it
    .join(',')  // comma-separated
  ).join('\r\n');  // rows starting on new lines
}
function download_as_file(content, file_type) {
  let mime_type = 'text/csv;charset=utf-8;';
  if (file_type == 'json')
    mime_type = 'application/json;charset=utf-8;';
  else
    file_type = 'csv';

  var blob = new Blob([content], {type: mime_type});
  var url = URL.createObjectURL(blob);

  var pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', `exported_links.${file_type}`);
  pom.click();
}
function download_as_csv() {
  const links = load_links_from_local_storage_sorted_by();
  const csv_links = convert_array_of_objects_to_csv(links);
  download_as_file(csv_links, 'csv');
}
function download_as_json() {
  const json_links = load_links_from_local_storage();
  download_as_file(JSON.stringify(json_links), 'json');
}

function calculate_days_passed_till_today(date) {  // https://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates
  // The number of milliseconds in all UTC days (no DST)
  const oneDay = 1000 * 60 * 60 * 24;
  const today = new Date();
  date = new Date(date);

  // A day in UTC always lasts 24 hours (unlike in other time formats)
  const start = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const end = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  // so it's safe to divide by 24 hours
  return (end - start) / oneDay;
}