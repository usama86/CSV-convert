const csvSplitStream = require("csv-split-stream");
const fs = require("fs");

csvSplitStream
  .split(
    fs.createReadStream("MOCK_DATA.csv"),
    {
      lineLimit: 10000,
    },
    (index) => fs.createWriteStream(`output-${index}.csv`)
  )
  .then((csvSplitResponse) => {
    console.log("csvSplitStream succeeded.", csvSplitResponse);
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
  });
