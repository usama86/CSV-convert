const csvSplitStream = require("csv-split-stream");
const followRedirect = require("follow-redirect-url");
const writeXlsxFile = require("write-excel-file/node");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const schema = [
  {
    column: "Url",
    type: String,
    value: (data) => data.url,
  },
  {
    column: "Redirect",
    type: Boolean,
    // format: "mm/dd/yyyy",
    value: (data) => data.redirect,
  },
  {
    column: "status",
    type: Number,
    // format: "#,##0.00",
    value: (data) => data.status,
  },
  {
    column: "redirectUrl",
    type: String,
    value: (data) => data.redirectUrl,
  },
];

const splitCSVFunction = (fileName) => {
  csvSplitStream
    .split(
      fs.createReadStream(fileName),
      {
        lineLimit: 10000,
      },
      (index) => {
        return fs.createWriteStream(`output/output-${index}.csv`);
      }
    )
    .then((csvSplitResponse) => {
      console.log("csvSplitStream succeeded.", csvSplitResponse);

      return csvSplitResponse;

      //   return csvSplitResponse;
      // outputs: {
      //  "totalChunks": 350,
      //  "options": {
      //    "delimiter": "\n",
      //    "lineLimit": "10000"
      //  }
      // }
    })
    .catch((csvSplitError) => {
      console.log("csvSplitStream failed!", csvSplitError);
      return null;
    });
};

const makeFilesCSV = splitCSVFunction("old-new_url.csv");

if (makeFilesCSV) {
  console.log(makeFilesCSV);
  console.log(makeFilesCSV.totalChunks);
  for (let i = 0; i < makeFilesCSV.totalChunks; i++) {
    readXlsxFile(`output-${i}.csv`).then((rows, index) => {
      console.log("HI");
      if (index === 0) console.log(rows);

      return;
      // `rows` is an array of rows
      // each row being an array of cells.
    });
  }
  followRedirect
    .startFollowing("https://bit.ly/2X7gCIT")
    .then(async (urls) => {
      console.log(urls);
      await writeXlsxFile(urls, {
        schema, // (optional) column widths, etc.
        filePath: "output/file.csv",
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

// console.log(makeFilesCSV);
