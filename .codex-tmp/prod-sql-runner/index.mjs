import mysql from "mysql2/promise";

function parseConnectionString(value) {
  const parsed = {};

  for (const part of String(value ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const key = part.slice(0, index).trim().toLowerCase();
    const val = part.slice(index + 1).trim();
    if (val) parsed[key] = val;
  }

  return {
    host: parsed.server ?? parsed.host ?? parsed["data source"],
    port: parsed.port ? Number(parsed.port) : 3306,
    user: parsed["user id"] ?? parsed.uid ?? parsed.user,
    password: parsed.password ?? parsed.pwd,
    database: parsed.database ?? parsed["initial catalog"],
    multipleStatements: true,
    dateStrings: true
  };
}

function getConnectionOptions() {
  if (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE) {
    return {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD ?? "",
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true,
      dateStrings: true
    };
  }

  return parseConnectionString(process.env.MYSQL_CONNECTION_STRING);
}

function summarize(value) {
  if (Array.isArray(value)) {
    return value.map((item) => summarize(item));
  }

  if (value && typeof value === "object") {
    if ("affectedRows" in value || "insertId" in value || "warningStatus" in value) {
      return {
        affectedRows: value.affectedRows ?? null,
        insertId: value.insertId ?? null,
        changedRows: value.changedRows ?? null,
        warningStatus: value.warningStatus ?? null
      };
    }

    const copy = {};
    for (const [key, val] of Object.entries(value)) {
      copy[key] = summarize(val);
    }
    return copy;
  }

  return value;
}

export async function handler(event) {
  const hasSplitEnvironment = process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE;
  if (!hasSplitEnvironment && !process.env.MYSQL_CONNECTION_STRING) {
    return { ok: false, error: "configuracao MySQL ausente" };
  }

  const sql = event?.sql;
  if (!sql || typeof sql !== "string") {
    return { ok: false, error: "Payload precisa conter sql string" };
  }

  let connection;
  try {
    connection = await mysql.createConnection(getConnectionOptions());
    const [results] = await connection.query(sql, event?.params ?? []);
    return { ok: true, results: summarize(results) };
  } catch (error) {
    return {
      ok: false,
      code: error?.code ?? null,
      errno: error?.errno ?? null,
      sqlState: error?.sqlState ?? null,
      error: error?.message ?? String(error)
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
