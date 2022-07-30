let inp = document.getElementById("file");
let outPutContainer = document.getElementById("outPutContainer");

function csvToArray(str, delimiter = ",") {
  // define columns
  const headers = ["id", "area", "name", "quantity", "brand"];

  // slice from \n index to the end of the text
  // use split to create an array of each csv value row
  const rows = str.split("\n");
  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index].replace(/[\r]/gm, "");
      return object;
    }, {});
    return el;
  });
  // return the array
  return arr;
}

function groupByName(arr = [], attr = "name") {
  let grouped = {};
  arr.forEach(function (a, i) {
    grouped[a[attr]] = grouped[a[attr]] || [];
    grouped[a[attr]].push(a);
  });
  return grouped;
}

function getPopular(brandArr = []) {
  let temp = {
    max: 0,
    brand: "",
  };
  const grouped = groupByName(brandArr, "brand");
  Object.keys(grouped).map(function (key, index) {
    let max = grouped[key].reduce(
      (prev, current) => +current.quantity + prev,
      0
    );
    if (max > temp.max) {
      temp.max = max;
      temp.brand = key;
    }
  });
  return temp.brand;
}

function calcAverageOrders(grouped, total) {
  let result = {};
  Object.keys(grouped).map(function (key, index) {
    result[key] = {};
    result[key].brand = getPopular(grouped[key]);
    let t = grouped[key].reduce((prev, current) => +current.quantity + prev, 0);
    result[key].total = t / total;
  });
  return result;
}
/**
 *
 * @param {Object} groups
 * @param {String} fileName
 * @param {String} attr
 */
function generateCSVLinks(groups = {}, fileName = "file name", attr = "") {
  let rows = [];
  Object.keys(groups).map(function (key, index) {
    rows.push([key, groups[key][attr]]);
  });
  let csvContent =
    "data:text/csv;charset=utf-8," + rows.map((e) => e.join()).join("\n");
  var encodedUri = encodeURI(csvContent);
  console.log(encodedUri);
  var link = document.createElement("a");
  link.innerText = fileName;
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  outPutContainer.appendChild(link); // Required for FF
}

// start Point 👇
inp.onchange = (e) => {
  let loadedFile = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    outPutContainer.innerHTML = "";
    const text = event.target.result;
    const data = csvToArray(text);
    const groupedAndAverageCalc = calcAverageOrders(
      groupByName(data),
      data.length
    );
    // map and save excel
    generateCSVLinks(groupedAndAverageCalc, `0_${loadedFile.name}`, "total");
    generateCSVLinks(groupedAndAverageCalc, `1_${loadedFile.name}`, "brand");
  };
  reader.readAsText(loadedFile);
};
