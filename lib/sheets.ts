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

// ── Stay History archive (one row per completed stay) ────────────────

export const STAY_HISTORY_SHEET = "Stay History";

export const STAY_HISTORY_HEADER = [
  "Stay ID",
  "Guest Name",
  "Phone",
  "Guests",
  "Room Number",
  "Room Type",
  "Check-in",
  "Check-out",
  "Nights",
  "Rate Per Night",
  "Room Total",
  "Food Total",
  "Tax",
  "Discount",
  "Grand Total",
  "Payment Status",
  "Archived At",
];

export type StayHistoryRow = {
  stayId: string;
  guestName: string;
  phone: string;
  guests: number;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  ratePerNight: number;
  roomTotal: number;
  foodTotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentStatus: string;
  archivedAt: string;
};

// ── Charges archive (one row per food line, keyed by Stay ID) ────────

export const CHARGES_SHEET = "Charges";

export const CHARGES_HEADER = [
  "Stay ID",
  "Guest Name",
  "Room Number",
  "Item Name",
  "Quantity",
  "Unit Price",
  "Subtotal",
];

export type ChargeArchiveRow = {
  stayId: string;
  guestName: string;
  roomNumber: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

/** Public link to the history spreadsheet (null when not configured). */
export function getHistorySheetUrl(): string | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return null;
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}

/**
 * Writes the header row to a sheet only when the sheet is still empty,
 * so repeated appends never duplicate the header.
 */
async function ensureHeader(
  sheets: Awaited<ReturnType<typeof getSheetsClient>>,
  spreadsheetId: string,
  sheetName: string,
  header: string[],
): Promise<void> {
  const firstCell = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:A1`,
  });
  if (!firstCell.data.values || firstCell.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [header] },
    });
  }
}

async function appendRows(
  sheetName: string,
  header: string[],
  rows: (string | number)[][],
): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return false;
  if (rows.length === 0) return true;

  try {
    const sheets = await getSheetsClient();
    await ensureHeader(sheets, spreadsheetId, sheetName, header);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: "RAW",
      requestBody: { values: rows },
    });
    return true;
  } catch (error) {
    console.error(`Failed to append to Google Sheets (${sheetName}):`, error);
    return false;
  }
}

/**
 * Append a new row for a room entry. Appends on both check-in and check-out
 * so the sheet shows the full history. Fails silently (returns null) if
 * Sheets is not configured, so the app never blocks on Sheets errors.
 */
export async function appendRoomEntryRow(
  row: RoomEntryRow,
): Promise<string | null> {
  const ok = await appendRows("Room Entries", HEADER, [
    [row.date, row.roomNumber, row.guestName, row.phone, row.guests, row.checkIn, row.checkOut, row.rate, row.chargesTotal, row.grandTotal],
  ]);
  return ok ? "appended" : null;
}

/**
 * Append one completed stay to the "Stay History" sheet.
 * Returns true only when the row was actually written.
 */
export async function appendStayHistoryRow(
  row: StayHistoryRow,
): Promise<boolean> {
  return appendRows(STAY_HISTORY_SHEET, STAY_HISTORY_HEADER, [
    [
      row.stayId,
      row.guestName,
      row.phone,
      row.guests,
      row.roomNumber,
      row.roomType,
      row.checkIn,
      row.checkOut,
      row.nights,
      row.ratePerNight,
      row.roomTotal,
      row.foodTotal,
      row.tax,
      row.discount,
      row.grandTotal,
      row.paymentStatus,
      row.archivedAt,
    ],
  ]);
}

/**
 * Append the stay's itemized food lines to the "Charges" sheet,
 * keyed by Stay ID so the manager can answer "what did Room 202 order?".
 * Returns true when written (or when there was nothing to write).
 */
export async function appendChargeRows(
  rows: ChargeArchiveRow[],
): Promise<boolean> {
  if (rows.length === 0) return true;
  return appendRows(
    CHARGES_SHEET,
    CHARGES_HEADER,
    rows.map((row) => [
      row.stayId,
      row.guestName,
      row.roomNumber,
      row.itemName,
      row.quantity,
      row.unitPrice,
      row.subtotal,
    ]),
  );
}
