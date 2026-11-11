"use client";

import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { useState } from "react";
import {
  History,
  ShieldCheck,
  Filter,
  User,
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

  const getActionBadgeVariant = (action: AdminAuditAction): "success" | "primary" | "error" | "secondary" => {
    switch (action) {
      case "CREATE":
      case "PUBLISH":
      case "RELEASE_RESULTS":
        return "success";
      case "UPDATE":
      case "IMPORT":
        return "primary";
      case "DELETE":
      case "REJECT":
        return "error";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrative System Audit Trail"
        description="Immutable log of all curriculum modifications, exam publications, bulk imports, and result releases."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Audit Logs" },
        ]}
        actions={
          <Badge variant="success" className="py-1 px-3">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Tamper-Resistant Ledger
          </Badge>
        }
      />

      {/* Filter Bar */}
      <Card className="p-4 flex items-center gap-3">
        <Filter className="h-4 w-4 text-text-muted" />
        <span className="text-xs font-bold text-text-primary">Filter Action:</span>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
        <span className="ml-auto text-xs text-text-muted font-medium">
          Showing {filteredLogs.length} audit entries
        </span>
      </Card>

      {/* Audit Logs Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary-bg/50 border-b border-border text-text-secondary font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity & Target</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Metadata</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary-bg/30 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant={getActionBadgeVariant(log.action_type)}>
                        {log.action_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-text-primary block">{log.target_entity}</span>
                      {log.target_id && (
                        <span className="text-[10px] text-text-muted font-mono">
                          ID: {log.target_id.slice(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-text-muted" />
                        <span className="font-medium text-text-primary">
                          {log.admin?.full_name || log.admin?.email || "System Admin"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-text-muted font-mono">
                      {log.metadata ? JSON.stringify(log.metadata) : "-"}
                    </td>
                    <td className="py-3 px-4 text-right text-text-muted">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10">
                    <EmptyState
                      icon={History}
                      title="No Audit Events Found"
                      description="No administrative activities have been logged for the selected filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
