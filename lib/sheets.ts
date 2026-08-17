import { google } from "googleapis";

const SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Google Sheets credentials. Set GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY.",
    );
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: SHEETS_SCOPES,
  });
}

export async function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

export type RoomEntryRow = {
  date: string;
  roomNumber: string;
  guestName: string;
  phone: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  rate: number;
  chargesTotal: number;
  grandTotal: number;
};

const HEADER = [
  "Date",
  "Room Number",
  "Guest Name",
  "Phone",
  "Guests",
  "Check-in",
  "Check-out",
  "Rate",
  "Charges Total",
  "Grand Total",
];

/**
 * Append a new row for a room entry. Appends on both check-in and check-out
 * so the sheet shows the full history. Fails silently (returns null) if
 * Sheets is not configured, so the app never blocks on Sheets errors.
 */
export async function appendRoomEntryRow(
  row: RoomEntryRow,
): Promise<string | null> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return null;

  try {
    const sheets = await getSheetsClient();
    const sheetName = "Room Entries";

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:J`,
      valueInputOption: "RAW",
      requestBody: {
        values: [HEADER, [row.date, row.roomNumber, row.guestName, row.phone, row.guests, row.checkIn, row.checkOut, row.rate, row.chargesTotal, row.grandTotal]],
      },
    });

    return "appended";
  } catch (error) {
    console.error("Failed to append to Google Sheets:", error);
    return null;
  }
}
