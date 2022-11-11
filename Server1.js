const csvSplitStream = require("csv-split-stream");
const followRedirect = require("follow-redirect-url");
const writeXlsxFile = require("write-excel-file/node");
// const readXlsxFile = require("read-excel-file/node");
// import { parse } from "csv-parse";
const { parse } = require("csv-parse");
const fs = require("fs");

const totalNumberOfUrl = 4999;
const fileToRead = "all_areas_with_subtype.csv";
const printLength = 4980;

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
    type: String,
    // format: "#,##0.00",
    value: (data) => data.status,
  },
  {
    column: "Hops",
    type: Number,
    value: (data) => data.Hops,
  },
  {
    column: "redirectUrl",
    type: String,
    value: (data) => data.redirectedUrl,
  },
];

const output = (iterator) => `output/output-${iterator}.csv`;

const UrlRedirectArr = [];
const UrlFailArr = [];

fs.createReadStream("output/output-2.csv")
  .pipe(parse({ delimiter: ",", from_line: 1 }))
  .on("data", function (row) {
    try {
      redirectFunction(row);
    } catch (e) {
      console.log(e);
      console.log("e");
    }
  });

function redirectFunction(row) {
  const options = {
    max_redirect_length: 1000,
    request_timeout: 1000000,
    ignoreSsslErrors: true,
  };
  try {
    followRedirect.startFollowing(row[0], options).then(async (urls) => {
      try {
        let getStatus = JSON.stringify([...urls.map((el) => el.status)]);

        console.log("Good", UrlRedirectArr.length);
        console.log("Bad", UrlFailArr.length);

        // if data coming error, let's try to resend it
        if (getStatus.includes("Error")) {
          const copy = {
            url: urls[0].url,
            redirect: urls[urls.length - 1].redirect,
            status: JSON.stringify([...urls.map((el) => el.status)]),
            Hops: urls.reduce((acc, cur) => {
              if (cur.status === 301) {
                return (acc += 1);
              }
              return acc;
            }, 0),
            redirectedUrl: urls[urls.length - 1].url,
          };
          // console.log(copy);
          if ((UrlRedirectArr.length + UrlFailArr.length) % 900 === 0) {
            /// NEED TO ADD
            printCSVFile();
          }
          UrlFailArr.push(copy);
        } else {
          const copy = {
            url: urls[0].url,
            redirect: urls[urls.length - 1].redirect,
            status: JSON.stringify([...urls.map((el) => el.status)]),
            Hops: urls.reduce((acc, cur) => {
              if (cur.status === 301) {
                return (acc += 1);
              }
              return acc;
            }, 0),
            redirectedUrl: urls[urls.length - 1].url,
          };
          // console.log(copy);
          UrlRedirectArr.push(copy);

          if ((UrlRedirectArr.length + UrlFailArr.length) % 900 === 0) {
            /// NEED TO ADD
            printCSVFile();
          }
        }
      } catch (e) {
        console.log("MAIN TRY");
        console.log(e);
      }
    });
  } catch (e) {
    console.log("MAIN TRY");
    console.log(e);
  }
}

async function printCSVFile() {
  await writeXlsxFile(UrlRedirectArr, {
    schema, // (optional) column widths, etc.
    filePath: "output/file5.csv",
  });
  await writeXlsxFile(UrlFailArr, {
    schema, // (optional) column widths, etc.
    filePath: "output/file6.csv",
  });
}
