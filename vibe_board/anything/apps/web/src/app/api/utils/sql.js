import pg from "pg";

const { Pool } = pg;

const NullishQueryFunction = () => {
  throw new Error(
    "No database connection string was provided. Perhaps process.env.DATABASE_URL has not been set",
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    "No database connection string was provided. Perhaps process.env.DATABASE_URL has not been set",
  );
};

const globalForPg = globalThis;

const pool =
  process.env.DATABASE_URL
    ? (globalForPg.__vibeBoardPgPool ??=
        new Pool({
          connectionString: process.env.DATABASE_URL,
        }))
    : null;

const queryFromTemplate = (strings, values) => ({
  text: strings.reduce((query, string, index) => {
    return `${query}${string}${index < values.length ? `$${index + 1}` : ""}`;
  }, ""),
  values,
});

const sql = pool
  ? async (stringsOrQuery, ...values) => {
      const query = Array.isArray(stringsOrQuery)
        ? queryFromTemplate(stringsOrQuery, values)
        : { text: stringsOrQuery, values: values[0] ?? [] };

      const result = await pool.query(query.text, query.values);
      return result.rows;
    }
  : NullishQueryFunction;

export default sql;
