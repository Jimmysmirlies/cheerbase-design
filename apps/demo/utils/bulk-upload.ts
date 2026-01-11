export type BulkMapping = {
  teamName: string;
  division: string;
  name: string;
  role: string;
  dob?: string;
  email?: string;
  phone?: string;
};

export type BulkMemberRow = {
  teamName: string;
  division: string;
  name: string;
  role: string;
  dob?: string;
  email?: string;
  phone?: string;
};

export type BulkTeam = {
  teamName: string;
  division: string;
  members: Array<
    Pick<BulkMemberRow, "name" | "role" | "dob" | "email" | "phone">
  >;
};

export function parseCsvText(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0] ?? "");
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i] ?? "");
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    const hasAny = Object.values(row).some(
      (v) => String(v ?? "").trim().length,
    );
    if (hasAny) rows.push(row);
  }
  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

export function guessMapping(headers: string[]): BulkMapping {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const find = (...candidates: string[]) => {
    const set = headers.map((h) => ({ h, n: norm(h) }));
    for (const c of candidates) {
      const n = norm(c);
      const match = set.find((x) => x.n.includes(n));
      if (match) return match.h;
    }
    return "";
  };
  const result: BulkMapping = {
    teamName: find("team name", "team") || headers[0] || "",
    division: find("division", "level", "category") || headers[1] || "",
    name: find("member name", "name", "athlete") || headers[2] || "",
    role: find("role", "type", "position") || headers[3] || "",
  };
  const dob = find("dob", "date of birth", "birthdate", "birth");
  const email = find("email");
  const phone = find("phone", "mobile");
  if (dob) result.dob = dob;
  if (email) result.email = email;
  if (phone) result.phone = phone;
  return result;
}

export function groupRowsByTeam(
  rows: Record<string, string>[],
  mapping: BulkMapping,
): BulkTeam[] {
  const key = (r: Record<string, string>) =>
    `${(r[mapping.teamName] || "").trim()}__${(r[mapping.division] || "").trim()}`;
  const map = new Map<string, BulkTeam>();
  for (const r of rows) {
    const k = key(r);
    const teamName = (r[mapping.teamName] || "").trim();
    const division = (r[mapping.division] || "").trim();
    if (!teamName || !division) continue;
    const memberName = (r[mapping.name] || "").trim();
    const role = (r[mapping.role] || "Athlete").trim();
    const dob = mapping.dob ? (r[mapping.dob] || "").trim() : undefined;
    const email = mapping.email ? (r[mapping.email] || "").trim() : undefined;
    const phone = mapping.phone ? (r[mapping.phone] || "").trim() : undefined;

    const existing = map.get(k);
    const member = { name: memberName, role, dob, email, phone };
    if (existing) {
      existing.members.push(member);
    } else {
      map.set(k, { teamName, division, members: [member] });
    }
  }
  return Array.from(map.values());
}
