export interface DatabaseErrorDetails {
  type: "DATABASE_CONNECTION_ERROR" | "SCHEMA_ERROR" | "PERMISSION_DENIED" | "DATABASE_QUERY_ERROR";
  message: string;
  table?: string;
  originalError?: any;
}

export function formatDatabaseError(err: any, table?: string): DatabaseErrorDetails {
  const rawMsg = err?.message || (typeof err === "string" ? err : "Unknown database error");

  if (
    rawMsg.includes("Could not find the table") ||
    rawMsg.includes("schema cache") ||
    rawMsg.includes("relation") && rawMsg.includes("does not exist")
  ) {
    return {
      type: "SCHEMA_ERROR",
      table,
      message: `Database schema error: Table '${table || "requested"}' is not found in the Supabase PostgreSQL schema cache. Please ensure migrations are applied in your Supabase project.`,
      originalError: err,
    };
  }

  if (
    rawMsg.includes("FetchError") ||
    rawMsg.includes("ECONNREFUSED") ||
    rawMsg.includes("ENOTFOUND") ||
    rawMsg.includes("network")
  ) {
    return {
      type: "DATABASE_CONNECTION_ERROR",
      table,
      message: "Database connection error: Unable to reach Supabase PostgreSQL. Please check your network and Supabase connection.",
      originalError: err,
    };
  }

  if (rawMsg.includes("permission denied") || rawMsg.includes("JWT") || rawMsg.includes("row-level security")) {
    return {
      type: "PERMISSION_DENIED",
      table,
      message: "Database permission error: Operation was denied by Supabase database authorization / RLS.",
      originalError: err,
    };
  }

  return {
    type: "DATABASE_QUERY_ERROR",
    table,
    message: `Database query error: ${rawMsg}`,
    originalError: err,
  };
}
