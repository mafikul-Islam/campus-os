import { RoutineClass, CalendarEvent } from '../types';

/**
 * Normalizes semester names for flexible matching (e.g., "1st Semester" -> "1st", "6th Sem" -> "6th").
 */
export function normalizeSemester(sem: string): string {
  if (!sem) return '';
  const match = sem.match(/(\d+)(st|nd|rd|th)/i);
  if (match) {
    return (match[1] + match[2]).toLowerCase();
  }
  const semLower = sem.toLowerCase();
  if (semLower.includes("first") || semLower.includes("one")) return "1st";
  if (semLower.includes("second") || semLower.includes("two")) return "2nd";
  if (semLower.includes("third") || semLower.includes("three")) return "3rd";
  if (semLower.includes("fourth") || semLower.includes("four")) return "4th";
  if (semLower.includes("fifth") || semLower.includes("five")) return "5th";
  if (semLower.includes("sixth") || semLower.includes("six")) return "6th";
  if (semLower.includes("seventh") || semLower.includes("seven")) return "7th";
  if (semLower.includes("eighth") || semLower.includes("eight")) return "8th";
  return sem.trim().toLowerCase();
}

/**
 * Normalizes section names to single letters (e.g., "F Sec" -> "F", "b" -> "B").
 */
export function normalizeSection(sec: string): string {
  if (!sec) return '';
  const secLower = sec.trim().toLowerCase();
  const match = secLower.match(/^([a-z])/i);
  if (match) {
    return match[1].toUpperCase();
  }
  return sec.trim().toUpperCase();
}

/**
 * Maps a course code to its full, user-friendly descriptive name.
 */
export function getCourseNameByCode(code: string): string {
  const mapping: Record<string, string> = {
    "PHY 1152": "Physics II Lab (Electromagnetism)",
    "PHY 1151": "Physics II (Electromagnetism)",
    "EEE 1131": "Electrical Circuits",
    "EEE 1132": "Electrical Circuits Lab",
    "MAT 1141": "Calculus & Geometry",
    "CSE 1100": "Introduction to Computer Systems",
    "ENG 0002": "English Foundation",
    "CHE 1161": "Chemistry"
  };
  return mapping[code.toUpperCase().trim()] || code;
}

/**
 * Formats standard slots to start/end times.
 */
export function formatTimeSlot(slotNum: number, originalTimeHeader: string): string {
  switch (slotNum) {
    case 1: return "09:00 AM - 10:00 AM";
    case 2: return "10:05 AM - 11:05 AM";
    case 3: return "11:10 AM - 12:10 PM";
    case 4: return "12:15 PM - 01:15 PM";
    case 5: return "01:50 PM - 02:50 PM";
    case 6: return "02:55 PM - 03:55 PM";
    default:
      return originalTimeHeader || "09:00 AM";
  }
}

/**
 * Simple CSV parser respecting quoted values with nested commas/newlines.
 */
export function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(col => col.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
}

/**
 * Parses raw CSV text into a structured array of all classes found in the routine.
 */
export function parseFullRoutineCsv(csvText: string): { day: string; colIdx: number; teacher: string; courseCode: string; semShort: string; secLetter: string; room: string }[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  const rawClasses: { day: string; colIdx: number; teacher: string; courseCode: string; semShort: string; secLetter: string; room: string }[] = [];
  let currentDay = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCsvLine(line);
    if (cols.length === 0) continue;

    // Check if first column has a day
    if (cols[0] && cols[0].trim()) {
      currentDay = cols[0].trim();
    }

    if (!currentDay) continue;

    // Slots are 1-indexed columns starting at index 1
    for (let colIdx = 1; colIdx < cols.length; colIdx++) {
      const cellContent = cols[colIdx]?.trim();
      if (!cellContent) continue;

      // Split cell lines (can have carriage returns or newlines inside quotes)
      const cellLines = cellContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (cellLines.length < 2) continue;

      const teacher = cellLines[0];
      const courseStr = cellLines[1] || '';
      const roomStr = cellLines[2] || '';

      const room = roomStr.replace(/Room:\s*/i, '').trim();

      // Match course format: "EEE 1131 (1st Sem. F Sec)"
      const match = courseStr.match(/^(.*?)\s*\((.*?)\s*Sem\.\s*(.*?)\s*Sec\)/i);
      if (match) {
        rawClasses.push({
          day: currentDay,
          colIdx,
          teacher,
          courseCode: match[1].trim(),
          semShort: match[2].trim(), // e.g., "1st"
          secLetter: match[3].trim(), // e.g., "F"
          room
        });
      } else {
        // Fallback for differently structured courses
        const simpleMatch = courseStr.match(/^(.*?)\s*\((.*?)\)/);
        if (simpleMatch) {
          rawClasses.push({
            day: currentDay,
            colIdx,
            teacher,
            courseCode: simpleMatch[1].trim(),
            semShort: simpleMatch[2].trim(),
            secLetter: '',
            room
          });
        }
      }
    }
  }

  return rawClasses;
}

/**
 * Fetches, caches, and filters the Google Sheet routine for a specific student's profile.
 * Saves the raw spreadsheet and syncs automatically.
 */
export async function syncRoutineFromGoogleSheet(
  userSemester: string,
  userSection: string
): Promise<{ success: boolean; classes: RoutineClass[]; cached: boolean; error?: string }> {
  try {
    // Call the server proxy endpoint
    const response = await fetch('/api/routine/fetch-sheet');
    if (!response.ok) {
      throw new Error(`Proxy fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success || !data.csv) {
      throw new Error(data.error || 'Invalid sheet routine data received');
    }

    const allRawClasses = parseFullRoutineCsv(data.csv);

    // Filter classes to match the student's profile
    const normUserSem = normalizeSemester(userSemester);
    const normUserSec = normalizeSection(userSection);

    const matchedRoutineClasses: RoutineClass[] = allRawClasses
      .filter(cls => {
        const normCellSem = normalizeSemester(cls.semShort);
        const normCellSec = normalizeSection(cls.secLetter);
        return normCellSem === normUserSem && normCellSec === normUserSec;
      })
      .map((cls, idx) => ({
        id: `gsh-${cls.day}-${cls.colIdx}-${cls.courseCode.replace(/\s+/g, '-')}-${idx}`,
        day: cls.day,
        courseName: getCourseNameByCode(cls.courseCode),
        courseCode: cls.courseCode,
        time: formatTimeSlot(cls.colIdx, `Slot ${cls.colIdx}`),
        room: cls.room,
        teacher: cls.teacher
      }));

    return {
      success: true,
      classes: matchedRoutineClasses,
      cached: !!data.cached
    };

  } catch (err: any) {
    console.error('Error in syncRoutineFromGoogleSheet:', err);
    return {
      success: false,
      classes: [],
      cached: false,
      error: err.message || 'Unknown network error'
    };
  }
}
