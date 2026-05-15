import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export interface MarkEntry {
  label: string;
  value: string;
}

export interface StudentResult {
  studentName: string;
  tabName: string;
  marks: MarkEntry[];
}

export async function findStudentMarks(
  email: string,
  studentId: string,
  passcode: string
): Promise<StudentResult | null> {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(
    /\\n/g,
    "\n"
  );
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  const sheetId = process.env.GOOGLE_SHEET_ID ?? "";

  const auth = new JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const doc = new GoogleSpreadsheet(sheetId, auth);
  await doc.loadInfo();

  console.log(
    `[Sheets] Connected to: "${doc.title}" — ${doc.sheetCount} tab(s) found`
  );

  for (let i = 0; i < doc.sheetCount; i++) {
    const sheet = doc.sheetsByIndex[i];
    const tabName = sheet.title;

    console.log(`[Sheets] Searching tab ${i + 1}/${doc.sheetCount}: "${tabName}"`);

    const rows = await sheet.getRows();

    if (rows.length === 0) {
      console.log(`[Sheets] Tab "${tabName}" is empty, skipping.`);
      continue;
    }

    const headers = sheet.headerValues;
    console.log(`[Sheets] Headers in "${tabName}":`, headers);

    // Locate the relevant column names (case-insensitive)
    const emailCol = headers.find((h) =>
      h.toLowerCase().includes("email")
    );
    const idCol = headers.find(
      (h) =>
        h.toLowerCase().includes("student id") ||
        h.toLowerCase().includes("studentid") ||
        h.toLowerCase().includes("id")
    );
    const passcodeCol = headers.find(
      (h) =>
        h.toLowerCase().includes("passcode") ||
        h.toLowerCase().includes("password")
    );

    if (!emailCol || !idCol || !passcodeCol) {
      console.log(
        `[Sheets] Tab "${tabName}" missing required columns (email/id/passcode), skipping.`
      );
      continue;
    }

    for (const row of rows) {
      const rowEmail = (row.get(emailCol) ?? "").toString().trim().toLowerCase();
      const rowId = (row.get(idCol) ?? "").toString().trim();
      const rowPasscode = (row.get(passcodeCol) ?? "").toString().trim();

      const emailMatch = rowEmail === email.trim().toLowerCase();
      const idMatch = rowId === studentId.trim();
      const passcodeMatch = rowPasscode === passcode.trim();

      if (emailMatch && idMatch && passcodeMatch) {
        console.log(
          `[Sheets] MATCH FOUND in tab "${tabName}" for student ID: ${studentId}`
        );

        // Find student name column
        const nameCol = headers.find(
          (h) =>
            h.toLowerCase().includes("name") &&
            !h.toLowerCase().includes("tab")
        );
        const studentName = nameCol
          ? (row.get(nameCol) ?? "Student").toString().trim()
          : studentId;

        // Map all headers to values, skipping credential + serial columns
        const credentialCols = new Set(
          [emailCol, idCol, passcodeCol, nameCol].filter(Boolean) as string[]
        );

        const SERIAL_RE =
          /^(sl\.?|serial(\s+(no\.?|number))?|s\.?\s*no\.?|sno\.?|sr\.?\s*no\.?|#|s\/n|sequence|index|row(\s+no\.?)?)$/i;

        const marks: MarkEntry[] = headers
          .filter((h) => !credentialCols.has(h) && !SERIAL_RE.test(h.trim()))
          .map((label) => ({
            label,
            value: (row.get(label) ?? "—").toString().trim(),
          }))
          .filter((entry) => entry.value !== "");

        return { studentName, tabName, marks };
      }
    }

    console.log(`[Sheets] No match in tab "${tabName}".`);
  }

  console.log(`[Sheets] No student found across all tabs.`);
  return null;
}