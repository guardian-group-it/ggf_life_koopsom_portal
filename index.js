const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const exphbs = require("express-handlebars");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
require("dotenv").config();

const server = http.createServer(app);
// const io = require("socket.io")(server);

const JWT_SECRET =
  'sdjkfh8923yhjdksbfmad3939&"#?"?#(#>Q(()@_#(##hjb2qiuhesdbhjdsfg839ujkdhfjk';

// require("./database");
app.set("views", path.join(__dirname, "views"));

const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(app.get("views"), "layouts"),
  partialsDir: path.join(app.get("views"), "partials"),
  extname: ".hbs",
  helpers: {
    ifeq: function (a, b, options) {
      if (a == b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    ifnoteq: function (a, b, options) {
      if (a != b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    firstL: function (options) {
      return options.charAt(0);
    },
  },
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

// Middleware
app.use(bodyParser.json());
app.use(morgan("tiny")); //Morgan
app.use(cors()); // cors
app.use(express.json()); // JSON
app.use(express.urlencoded({ extended: false })); //urlencoded
app.use(bodyParser.json());

app.post("/send_to_api", async (req, res) => {
  const resultJson = req.body;
  var gnummer, datenow;

  //get total amount of all single premium
  const totalamount = resultJson.data.reduce((total, user) => {
    return total + user["Single Premium"];
  }, 0);

  //find Gnummber in Compass based on the name
  try {
    // Open a connection to the database
    // prod "Dsn=compassodbc;uid=UIPATH;pwd=Welcome123#"
    const connection = await odbc.connect(
      "Dsn=compasstest;uid=UIPATH_ADV;pwd=XNIOEpA4JR"
    );

    // Perform a query
    const result = await connection.query(
      `SELECT CONT_NO FROM PORTAL.PTL_CASE_DATA WHERE PLAN_NM = '${resultJson.Employer}'`
    );

    gnummer = result[0].CONT_NO;
    // res.json({ wn: resultmem.length, wg: resultcomp.length });

    // Close the connection
    await connection.close();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }

  //get date
  function getFormattedDate() {
    const now = new Date();
  
    const day = String(now.getDate()).padStart(2, '0'); // Day with leading zero
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month with leading zero (0-indexed, so +1)
    const year = now.getFullYear();
  
    const hours = String(now.getHours()).padStart(2, '0'); // Hours with leading zero
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Minutes with leading zero
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Seconds with leading zero
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0'); // Milliseconds with leading zeros
  
    datenow = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}:${milliseconds}`;
  }
  getFormattedDate();

  //create the json to send to API
  const outputJson = {
    Mutaties: {
      Portal_Request: [
        {
          CASE_KEY: gnummer,
          UPLOAD_DT: datenow,
          PYRL_CONTRIB_AMT: "",
          PYRL_CONTRIB_EFF_DT: "",
          PAYROLL_BEG_DT: "",
          PAYROLL_END_DT: "",
          TYP_CD: "00",
          PORTAL_CHANGE_CD: "6",
          SAL_RENEW_CD: "N",
          CHNG_DT: datenow,
          SPRM_TOTAL_AMT: totalamount,
          Member_Request: [],
          SINGLE_PREMIUMS: resultJson.data.map((wn) => ({
            CASE_MBR_KEY: wn["Participant Number"],
            SINGLE_PREMIUM: wn["Single Premium"],
          })),
          Miscellaneous_Request: {
            CASE_MBR_KEY: "",
            PEND_MBR_REF_ID: "",
            NATLIDNO: "",
            PYRL_NO: "",
            CHNG_TYP_CD: "",
            CHNG_AMT: "",
            CHNG_DT: "",
            CHNG_DATA: "",
            CHNG_PCT: "",
            CHNG_EXIT_REAS_CD: "",
            CHNG_EXIT_DT: "",
            SPOUSAL_CNT: "",
            DEPENDENT_CNT: "",
            BIRTH_DT_DEPENDENT: "",
            BIRTH_COUNTRY_CD: "",
            ADDR_LINE1: "",
            ADDR_LINE2: "",
            ADDR_LINE3: "",
            ADDR_CITY: "",
            ADDR_POST_CD: "",
            ADDR_COUNTRY_TXT: "",
            ADDR_COUNTRY_CD: "",
            ADDR_EMAIL: "",
            PHONE: "",
            NATIONALITY_CD: "",
            MBGP_KEY: "",
            MBGC_KEY: "",
            files: {
              id: "",
              id_partner: "",
              health_form: "",
              birth_certificate: "",
            },
          },
          Payroll_Request: {
            MBR_TYP_CD: "",
            MBGC_KEY: "",
            PYRL_NO: "",
            CASE_MBR_KEY: "",
            PEND_MBR_REF_ID: "",
            NATLIDNO: "",
            BIRTHDT: "",
            CHNG_DT: "",
            JOIN_SCH_DT: "",
            JOIN_COMP_DT: "",
            FIRSTNAME: "",
            LASTNAM: "",
            MIDNAME: "",
            NAMEPREFIX: "",
            NAMESUFFIX: "",
            ANN_SAL_AMT: "",
            SAL_EFF_DT: "",
            PART_TIME_PCT: "",
            SEXCD: "",
            SPOUSAL_CNT: "",
            DEPENDENT_CNT: "",
          },
        },
      ],
      Aantal_Mutaties: "1",
    },
  };

  console.log(outputJson);
  getTokenAndSendRequest(outputJson)
  res.json({status:"202"})
  //send json to API
  async function getTokenAndSendRequest(output) {
    try {
      // First POST request to get the token with basic auth
      const auth = {
        username: 'h3tMbOEy-iA305q-H7muYg..',
        password: 'PggJQEGXFwMvgDEJtMUQ0w..',
      };
  
      const tokenResponse = await axios.post(
        'http://200.16.93.41:8080/portal/ptl/oauth/token',
        qs.stringify({
          grant_type: 'client_credentials',
        }),
        {
          auth, // Basic authentication
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      // Extract the token from the response
      const token = tokenResponse.data.access_token;
      console.log('Token received:', token);
  
      const response = await axios.post(
        'http://200.16.93.41:8080/portal/ptl/inpension/transaction', // Replace with actual endpoint
        output,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in Authorization header
            'Content-Type': 'application/json',
          },
        }
      );
      res.json({status:"202", data:response.data})
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  }
  
});



app.use(require("./routes"));
app.use(express.static(path.join(__dirname, "public")));

// const server = http.createServer(app);

app.set("port", process.env.PORT || 8087);

server.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
});
