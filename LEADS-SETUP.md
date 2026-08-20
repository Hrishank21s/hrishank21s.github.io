# Wiring up lead capture (Google Sheet)

The site's "Request a demo" modal posts name/phone/email to a URL you control.
This sets that URL up as a Google Sheet, fully separate from the TableTrackr
app's own database.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a blank sheet.
2. Rename it something like `TableTrackr Leads`.
3. In row 1, add headers: `Timestamp | Name | Phone | Email | Source`.

## 2. Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code and paste this:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    new Date(),
    e.parameter.name  || '',
    e.parameter.phone || '',
    e.parameter.email || '',
    e.parameter.source || ''
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Save** (name the project e.g. `tabletrackr-leads`).

## 3. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**. Google will ask you to authorize the script (it's your
   own script accessing your own Sheet — click through the "unverified app"
   warning via **Advanced → Go to tabletrackr-leads (unsafe)**, then **Allow**).
5. Copy the **Web app URL** it gives you — looks like:
   `https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

## 4. Give me the URL

Paste that URL back in chat and I'll drop it into
[assets/script.js](assets/script.js) (replacing `LEAD_WEBHOOK_URL`), commit,
and push — the modal will start saving straight into your Sheet.

## Notes

- The webhook URL is public by design (Apps Script Web Apps work this way).
  The honeypot field in the form filters out basic bots; if spam becomes a
  real problem later, we can add a shared-secret check in the script.
- Anyone who has your Sheet open will see submissions land in real time —
  no extra dashboard needed.
