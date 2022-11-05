const csvSplitStream = require("csv-split-stream");
const followRedirect = require("follow-redirect-url");
const writeXlsxFile = require("write-excel-file/node");
// const readXlsxFile = require("read-excel-file/node");
// import { parse } from "csv-parse";
const { parse } = require("csv-parse");
const fs = require("fs");

const totalNumberOfUrl = 1408;

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
  //   {
  //     column: "redirectUrl",
  //     type: String,
  //     value: (data) => data.redirectUrl,
  //   },
];

let vvv = null;
const splitCSVFunction = (fileName) => {
  const data = csvSplitStream
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

  return data;
};

const output = (iterator) => `output/output-${iterator}.csv`;

const makeFilesCSV = splitCSVFunction("cities_urls.csv").then(
  async (makeFilesCSV) => {
    const UrlRedirectArr = [];
    if (makeFilesCSV) {
      for (let i = 0; i < makeFilesCSV.totalChunks; i++) {
        // let x = ;
        // console.log(x);
        // if (i === makeFilesCSV.totalChunks) {
        //   console.log("finished");
        //   console.log("HI");
        //   console.log(UrlRedirectArr);
        //   await writeXlsxFile(UrlRedirectArr, {
        //     schema, // (optional) column widths, etc.
        //     filePath: "output/file.csv",
        //   });
        //   return;
        // }

        fs.createReadStream(output(i))
          .pipe(parse({ delimiter: ",", from_line: 1 }))
          .on("data", function (row) {
            const options = {
              // max_redirect_length: 5,
              request_timeout: 100000,
              ignoreSsslErrors: true,
            };

            followRedirect
              .startFollowing(row[0], options)
              .then(async (urls) => {
                // console.log(urls);
                if (urls[0].url === "url") return;
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
                };
                // console.log(copy);
                UrlRedirectArr.push(copy);

                if (UrlRedirectArr.length === totalNumberOfUrl)
                  /// NEED TO ADD
                  await writeXlsxFile(UrlRedirectArr, {
                    schema, // (optional) column widths, etc.
                    filePath: "output/file.csv",
                  });
              })
              .catch((error) => {
                console.log("YO");
                console.log(error);
              });
          })
          .on("end", async function () {
            // console.log("finished");
            // console.log("HI");
            // console.log(UrlRedirectArr);
            // await writeXlsxFile(UrlRedirectArr, {
            //   schema, // (optional) column widths, etc.
            //   filePath: "output/file.csv",
            // });
          })
          .on("error", function (error) {
            console.log(error.message);
          });
      }
    }

    // console.log(makeFilesCSV);
  }
);

/**
 * 
  await writeXlsxFile([objects1, objects2], {
  schema: [schema1, schema2],
  sheets: ['Sheet 1', 'Sheet 2'],
  filePath: '/path/to/file.xlsx'
})
 */

// writeXlsxFile(
//   [
//     {
//       url: "https://test1.graana.rocks/rent/residential-properties-rent-jhelum-193/",
//       redirect: false,
//       status: "302",
//       Hops: 2,
//     },
//   ],
//   {
//     schema, // (optional) column widths, etc.
//     filePath: "output/file.csv",
//   }
// );
