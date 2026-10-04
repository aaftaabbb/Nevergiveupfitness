import mongoose, { type Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing. Locally: add it to .env.local (see .env.example). " +
      "On Vercel: Project -> Settings -> Environment Variables, add MONGODB_URI and MONGODB_DB " +
      "for all environments, then redeploy.",
  );
}

// Set in code rather than in the URI path on purpose: Atlas creates the database
// user against `admin`, so putting a database name in the connection string would
// move the default authSource and the login would fail.
const MONGODB_DB = process.env.MONGODB_DB || "never-give-up-fitness";

// Vercel reuses a warm lambda across requests, so the connection is cached on
// globalThis. Without this every server action would open a new socket.
interface MongooseCache {
  connection: Connection | null;
  promise: Promise<Connection> | null;
}

const globalForMongoose = globalThis as typeof globalThis & {
  __ngufMongoose?: MongooseCache;
};

const cache = (globalForMongoose.__ngufMongoose ??= { connection: null, promise: null });

export function connectToDatabase(): Promise<Connection> {
  if (cache.connection) return Promise.resolve(cache.connection);

  cache.promise ??= mongoose
    .connect(MONGODB_URI as string, {
      dbName: MONGODB_DB,
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10_000,
    })
    .then((resolved) => {
      cache.connection = resolved.connection;
      return resolved.connection;
    });

  return cache.promise;
}
