"use client";
/**
 * UploadRosterDialog
 *
 * Purpose
 * - Demo CSV/Excel upload preview with duplicate team safeguards.
 * - Parses simple CSV (client-only) and shows rows for confirmation.
 *
 * Notes
 * - For Excel parsing, a real app would use SheetJS; here we focus on CSV.
 */
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/shadcn/select";
import { Card, CardContent } from "@workspace/ui/shadcn/card";
import { demoTeams } from "@/data/club/teams";
import { downloadTextFile } from "@/utils/download";

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

type ColumnKey = "teamName" | "firstName" | "lastName" | "dob" | "email" | "phone" | "role";
const requiredColumns: ColumnKey[] = ["firstName", "lastName"];

export default function UploadRosterDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<string[][]>([]);
  const [columnMap, setColumnMap] = useState<Record<ColumnKey, number | null>>({
    teamName: null,
    firstName: null,
    lastName: null,
    dob: null,
    email: null,
    phone: null,
    role: null,
  });
  const [action, setAction] = useState<"select_existing" | "create_new">("create_new");

  const headers = rows[0] || [];
  const body = rows.slice(1);

  const firstTeamValue = useMemo(() => {
    const idx = columnMap.teamName;
    return idx != null && body[0]?.[idx] ? body[0][idx] : "";
  }, [columnMap.teamName, body]);

  const duplicate = useMemo(() => {
    if (!firstTeamValue) return null;
    return demoTeams.find((t) => t.name.toLowerCase() === firstTeamValue.toLowerCase()) || null;
  }, [firstTeamValue]);

  const previewMembers = useMemo(() => {
    return body.map((row) => {
      const read = (key: ColumnKey) => {
        const idx = columnMap[key];
        return idx != null ? row[idx] ?? "" : "";
      };
      return {
        teamName: read("teamName"),
        firstName: read("firstName"),
        lastName: read("lastName"),
        dob: read("dob"),
        email: read("email"),
        phone: read("phone"),
        role: read("role"),
      };
    });
  }, [body, columnMap]);

  const roleSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    previewMembers.forEach((member) => {
      const key = member.role || "Unassigned";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [previewMembers]);

  const missingColumns = requiredColumns.filter((key) => columnMap[key] == null);
  const canConfirm = rows.length > 1 && missingColumns.length === 0;

  const onFile = async (file?: File | null) => {
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    setRows(parsed);
    setAction("create_new");
    if (!parsed[0]) return;
    const headerRow = parsed[0];
    const infer = (matchers: RegExp[]) => {
      const idx = headerRow.findIndex((header) => matchers.some((regex) => regex.test(header)));
      return idx >= 0 ? idx : null;
    };
    setColumnMap({
      teamName: infer([/team/i, /club/i]),
      firstName: infer([/first/i, /given/i]),
      lastName: infer([/last/i, /family/i, /surname/i]),
      dob: infer([/birth/i, /dob/i]),
      email: infer([/email/i]),
      phone: infer([/phone/i, /mobile/i, /contact/i]),
      role: infer([/role/i, /position/i]),
    });
  };

  const columnOptions = headers.map((header, idx) => ({ label: header, value: String(idx) }));

  const handleTemplateDownload = () => {
    const headersLine = "Team Name,First Name,Last Name,Date of Birth,Email,Phone,Role";
    const sampleLine = "Example Team,Alex,Morgan,1990-04-12,alex@example.com,+1 555-0101,Coach";
    downloadTextFile("team-roster-template.csv", `${headersLine}\n${sampleLine}\n`);
  };

  const handleConfirm = () => {
    console.table(previewMembers);
    setOpen(false);
    setRows([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Upload CSV / Excel</Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Upload roster</DialogTitle>
          <DialogDescription>Preview and confirm before creating a team.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <Button variant="ghost" size="sm" type="button" onClick={handleTemplateDownload}>
              Download template
            </Button>
          </div>

          {rows.length > 0 ? (
            <div className="space-y-4">
              {firstTeamValue ? (
                <div className="rounded-2xl border bg-muted/30 p-3 text-sm">
                  <p>
                    Detected team: <span className="font-medium">{firstTeamValue}</span>
                  </p>
                  {duplicate ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-amber-600">A team named "{firstTeamValue}" already exists.</p>
                      <div className="flex gap-2 text-xs">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="dup-action"
                            checked={action === "select_existing"}
                            onChange={() => setAction("select_existing")}
                          />
                          Select existing ({duplicate.name})
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="dup-action"
                            checked={action === "create_new"}
                            onChange={() => setAction("create_new")}
                          />
                          Create new team
                        </label>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <Card>
                <CardContent className="space-y-3 px-4 py-4">
                  <p className="text-sm font-semibold">Map columns</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([
                      { key: "teamName", label: "Team Name" },
                      { key: "firstName", label: "First Name", required: true },
                      { key: "lastName", label: "Last Name", required: true },
                      { key: "dob", label: "Date of Birth" },
                      { key: "email", label: "Email" },
                      { key: "phone", label: "Phone" },
                      { key: "role", label: "Role" },
                    ] as Array<{ key: ColumnKey; label: string; required?: boolean }>).map(({ key, label, required }) => (
                      <div key={key} className="space-y-1 text-xs">
                        <p className="font-medium text-muted-foreground">
                          {label} {required ? <span className="text-red-500">*</span> : null}
                        </p>
                        <Select
                          value={columnMap[key] != null ? String(columnMap[key]) : "unassigned"}
                          onValueChange={(value) =>
                            setColumnMap((prev) => ({
                              ...prev,
                              [key]: value === "unassigned" ? null : Number(value),
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {columnOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  {missingColumns.length > 0 ? (
                    <p className="text-xs text-amber-600">
                      Select columns for: {missingColumns.map((key) => key.replace(/([A-Z])/g, " $1")).join(", ")}
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                <div className="overflow-auto rounded-2xl border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {body.map((r, i) => (
                        <tr key={i} className="border-t">
                          {r.map((c, j) => (
                            <td key={j} className="px-3 py-2">
                              {c}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Card>
                  <CardContent className="space-y-3 px-4 py-4 text-xs">
                    <p className="font-semibold">Summary</p>
                    <p>Total rows detected: {previewMembers.length}</p>
                    <div className="space-y-1">
                      {Object.entries(roleSummary).map(([role, count]) => (
                        <p key={role}>
                          {role}: <span className="font-medium">{count}</span>
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Upload a CSV with columns like Team Name, First Name, Last Name, Role, Email, and Phone.</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
