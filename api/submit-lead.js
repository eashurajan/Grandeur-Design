/*
  POST /api/submit-lead

  Vercel serverless function. The browser sends the enquiry form here.
  This file reads Google credentials from environment variables and appends
  one row to the spreadsheet. Credentials never go to the frontend.

  Required environment variables:
    GOOGLE_CLIENT_EMAIL
    GOOGLE_PRIVATE_KEY
    GOOGLE_SHEET_ID

  The row is appended to the first tab of the spreadsheet.
  If that tab is empty, the function writes this header row first:
    Timestamp | Name | Phone | Email | Service | Project | Project other | Budget | Project brief
*/

const HEADERS = [
  "Timestamp",
  "Name",
  "Phone",
  "Email",
  "Service",
  "Project",
  "Project other",
  "Budget",
  "Project brief",
];

const { google } = require("googleapis");

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_CHOICE = 200;
const MAX_BRIEF = 2000;

function envValue(name) {
  let value = process.env[name] || "";
  value = value.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value;
}

function privateKey() {
  return envValue("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
}

function text(value, max) {
  const clean = String(value == null ? "" : value)
    .replace(/\s+/g, " ")
    .trim();

  return clean.slice(0, max);
}

function letterCount(value) {
  return (value.match(/[A-Za-z]/g) || []).length;
}

function validate(body) {
  const name = text(body.name, MAX_NAME);
  const phone = String(body.phone == null ? "" : body.phone).replace(/\D/g, "");
  const email = text(body.email, MAX_EMAIL).toLowerCase();
  const service = text(body.service, MAX_CHOICE);
  const project = text(body.project, MAX_CHOICE);
  const projectOther = text(body.projectOther, MAX_CHOICE);
  const budget = text(body.budget, MAX_CHOICE);
  const brief = text(body.brief, MAX_BRIEF);
  const website = text(body.website, 200);

  if (letterCount(name) <= 3) {
    return { error: "Enter your full name." };
  }

  if (!/^\d{10}$/.test(phone)) {
    return { error: "Phone number must be 10 digits." };
  }

  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (!service) {
    return { error: "Choose a service." };
  }

  if (!project && !projectOther) {
    return { error: "Choose a project type." };
  }

  if (!budget) {
    return { error: "Choose a budget range." };
  }

  if (!brief) {
    return { error: "Tell us a little about your project." };
  }

  return {
    lead: { name, phone, email, service, project, projectOther, budget, brief, website },
  };
}

async function appendLead(lead) {
  const auth = new google.auth.JWT({
    email: envValue("GOOGLE_CLIENT_EMAIL"),
    key: privateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = envValue("GOOGLE_SHEET_ID");
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const title = meta.data.sheets?.[0]?.properties?.title || "Sheet1";
  const range = `'${title.replace(/'/g, "''")}'!A:I`;
  const header = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title.replace(/'/g, "''")}'!A1:I1`,
  });

  if (!header.data.values || !header.data.values.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${title.replace(/'/g, "''")}'!A1:I1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        new Date().toISOString(),
        lead.name,
        lead.phone,
        lead.email,
        lead.service,
        lead.project,
        lead.projectOther,
        lead.budget,
        lead.brief,
      ]],
    },
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const missing = ["GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_SHEET_ID"].filter(
    (name) => !envValue(name)
  );

  if (missing.length) {
    console.error("submit-lead is missing environment variables:", missing.join(", "));
    return res.status(500).json({
      success: false,
      message: "Enquiry service is not configured.",
    });
  }

  let body = req.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      body = null;
    }
  }

  if (!body || typeof body !== "object") {
    return res.status(400).json({ success: false, message: "Invalid enquiry." });
  }

  const result = validate(body);

  if (result.error) {
    return res.status(400).json({ success: false, message: result.error });
  }

  /* Filled honeypot means a bot. Pretend the save worked and do not write a row. */
  if (result.lead.website) {
    return res.status(200).json({ success: true });
  }

  try {
    await appendLead(result.lead);
  } catch (error) {
    console.error("submit-lead failed:", error && error.message ? error.message : error);
    return res.status(500).json({
      success: false,
      message: "Could not save your enquiry. Please try again.",
    });
  }

  return res.status(200).json({ success: true });
};
