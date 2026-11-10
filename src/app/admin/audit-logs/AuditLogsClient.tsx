"use client";

import { useState } from "react";
import {
  History,
  ShieldCheck,
  Filter,
  User,
  Calendar,
  Layers,
  FileQuestion,
  Play,
} from "lucide-react";
import type { AdminAuditLog, AdminAuditAction } from "@/lib/types";

interface AuditLogsClientProps {
  logs: AdminAuditLog[];
}

export default function AuditLogsClient({ logs }: AuditLogsClientProps) {
  const [filterAction, setFilterAction] = useState<string>("ALL");

  const filteredLogs = logs.filter((l) => {
    if (filterAction === "ALL") return true;
    return l.action_type === filterAction;
  });

  const getActionBadge = (action: AdminAuditAction) => {
    switch (action) {
      case "CREATE":
      case "PUBLISH":
      case "RELEASE_RESULTS":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "UPDATE":
      case "IMPORT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DELETE":
      case "REJECT":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="h-7 w-7 text-indigo-600" />
            Administrative System Audit Trail
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Immutable log of all curriculum modifications, exam publications, bulk imports, and result releases.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Tamper-Resistant Audit Ledger</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="font-bold text-slate-700">Filter Action:</span>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Administrative Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="PUBLISH">PUBLISH</option>
          <option value="UNPUBLISH">UNPUBLISH</option>
          <option value="IMPORT">IMPORT</option>
          <option value="REJECT">REJECT</option>
          <option value="RELEASE_RESULTS">RELEASE_RESULTS</option>
        </select>
        <span className="ml-auto text-slate-500 font-medium">
          Showing {filteredLogs.length} audit entries
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity & Target</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Metadata</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getActionBadge(
                          log.action_type
                        )}`}
                      >
                        {log.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.target_entity}</span>
                      {log.target_id && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {log.target_id.slice(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {log.admin?.full_name || log.admin?.email || "System Admin"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500 font-mono">
                      {log.metadata ? JSON.stringify(log.metadata) : "-"}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No administrative audit events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
