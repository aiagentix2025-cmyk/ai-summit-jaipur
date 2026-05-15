# AGENTiX Google Sheets Form Setup

The landing page form is mapped to this spreadsheet:

`https://docs.google.com/spreadsheets/d/1Huev9R4ncqKdl3e6TeiPcMqMASPEmaBZPllemHEJSog/edit?gid=0#gid=0`

## Deploy Steps

1. Open the Google Sheet.
2. Go to `Extensions` -> `Apps Script`.
3. Paste the full contents of `google-sheets-apps-script.gs`.
4. Click `Deploy` -> `New deployment`.
5. Choose type: `Web app`.
6. Execute as: `Me`.
7. Who has access: `Anyone`.
8. Click `Deploy` and copy the Web App URL.
9. Open `script.js`.
10. Paste the Web App URL here:

```js
const GOOGLE_SHEETS_WEB_APP_URL = "PASTE_WEB_APP_URL_HERE";
```

The form fields already match the sheet headers exactly:

- Name
- Company Name
- Industry
- Phone Number
- Email
- Budget Range
- Current Tools You Use
- What bottleneck do you want to solve?
- Preferred Timeline

