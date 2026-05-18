import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export interface MarkEntry {
  label: string;
  value: string;
}

export interface CourseInfo {
  courseCode: string;
  courseTitle: string;
  facultyName: string;
  facultyInitials: string;
  semester: string;
  section: string;
}

export interface StudentResult {
  studentName: string;
  tabName: string;
  marks: MarkEntry[];
  courseInfo: CourseInfo;
}

export interface MasterLookupResult {
  sheetId: string;
  courseInfo: CourseInfo;
}

function createAuth(): JWT {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

const SERIAL_RE =
  /^(sl\.?|serial(\s+(no\.?|number))?|s\.?\s*no\.?|sno\.?|sr\.?\s*no\.?|#|s\/n|sequence|index|row(\s+no\.?)?)$/i;

/**
 * Step A: Look up the master index sheet by composite course key.
 * Returns the target sheet ID + course metadata, or null if not found.
 */
export async function getTargetSheet(courseId: string): Promise<MasterLookupResult | null> {
  const masterSheetId = process.env.MASTER_INDEX_SHEET_ID ?? "";
  const doc = new GoogleSpreadsheet(masterSheetId, createAuth());
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;

  const codeCol    = headers.find((h) => h.toLowerCase().includes("course code"));
  const titleCol   = headers.find((h) => h.toLowerCase().includes("course title"));
  const nameCol    = headers.find((h) => h.toLowerCase() === "name" || (h.toLowerCase().includes("name") && !h.toLowerCase().includes("course")));
  const initCol    = headers.find((h) => h.toLowerCase().includes("initial"));
  const sectionCol = headers.find((h) => h.toLowerCase().includes("section"));
  const semCol     = headers.find((h) => h.toLowerCase().includes("semester"));
  const sheetCol   = headers.find((h) => h.toLowerCase().includes("sheet id"))
    ?? headers.find((h) => h.toLowerCase().includes("sheet"));

  if (!sheetCol) {
    console.error("[Sheets] Master index missing Sheet ID column");
    return null;
  }

  for (const row of rows) {
    const code    = (codeCol    ? row.get(codeCol)    ?? "" : "").toString().trim();
    const init    = (initCol    ? row.get(initCol)    ?? "" : "").toString().trim();
    const section = (sectionCol ? row.get(sectionCol) ?? "" : "").toString().trim();
    const sem     = (semCol     ? row.get(semCol)     ?? "" : "").toString().trim().replace(/-/g, "");

    const compositeKey = [code, init, section, sem].filter(Boolean).join("-");

    if (compositeKey.toLowerCase() === courseId.trim().toLowerCase()) {
      const sheetId = (row.get(sheetCol) ?? "").toString().trim();
      if (!sheetId) return null;

      return {
        sheetId,
        courseInfo: {
          courseCode:      code,
          courseTitle:     (titleCol   ? row.get(titleCol)   ?? "" : "").toString().trim(),
          facultyName:     (nameCol    ? row.get(nameCol)    ?? "" : "").toString().trim(),
          facultyInitials: init,
          semester:        (semCol     ? row.get(semCol)     ?? "" : "").toString().trim(),
          section:         section,
        },
      };
    }
  }

  return null;
}

/**
 * Steps B + C: Search the target sheet for a row matching both email AND student ID.
 * Iterates through all tabs and returns on first match for speed.
 */
export async function findStudentInSheet(
  sheetId: string,
  email: string,
  studentId: string,
  courseInfo: CourseInfo
): Promise<StudentResult | null> {
  const doc = new GoogleSpreadsheet(sheetId, createAuth());
  await doc.loadInfo();

  for (let i = 0; i < doc.sheetCount; i++) {
    const sheet = doc.sheetsByIndex[i];
    const tabName = sheet.title;

    const rows = await sheet.getRows();
    if (rows.length === 0) continue;

    const headers = sheet.headerValues;

    const emailCol = headers.find((h) => h.toLowerCase().includes("email"));
    const idCol =
      headers.find((h) => h.toLowerCase().includes("student id")) ??
      headers.find((h) => h.toLowerCase().includes("studentid")) ??
      headers.find((h) => h.toLowerCase() === "id");

    if (!emailCol || !idCol) continue;

    for (const row of rows) {
      const rowEmail = (row.get(emailCol) ?? "").toString().trim().toLowerCase();
      const rowId    = (row.get(idCol)    ?? "").toString().trim();

      if (rowEmail === email.trim().toLowerCase() && rowId === studentId.trim()) {

        const nameCol = headers.find(
          (h) => h.toLowerCase().includes("name") && !h.toLowerCase().includes("tab")
        );
        const studentName = nameCol
          ? (row.get(nameCol) ?? studentId).toString().trim()
          : studentId;

        const credentialCols = new Set(
          [emailCol, idCol, nameCol].filter(Boolean) as string[]
        );

        const marks: MarkEntry[] = headers
          .filter((h) => !credentialCols.has(h) && !SERIAL_RE.test(h.trim()))
          .map((label) => ({
            label,
            value: (row.get(label) ?? "—").toString().trim(),
          }))
          .filter((entry) => entry.value !== "");

        return { studentName, tabName, marks, courseInfo };
      }
    }
  }

  return null;
}
