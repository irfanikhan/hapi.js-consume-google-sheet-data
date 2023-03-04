const Hapi = require("@hapi/hapi");
const { google } = require("googleapis");

const credentials = require("./credentials.json");
const sheets = google.sheets({ version: "v4", auth: credentials.web });

async function getSheetData(spreadsheetId, range) {
  try {
    const auth = await google.auth.getClient({
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    return rows;
  } catch (e) {
    // error
    console.log(e)
    throw e;
  }
}

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: "localhost",
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello World!";
    },
  });

  server.route({
    method: "GET",
    path: "/google-signin",
    handler: (req, res) => {
      // Example usage
      const spreadsheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";
      const range = "Sheet1!A1:D10";

      return getSheetData(spreadsheetId, range)
        .then((rows) => {
          console.log(rows);
          // Do something with the data
          return rows;
        })
        .catch((err) => {
            throw err;
        });
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
