import crypto from "node:crypto";
import fs from "node:fs/promises";
import net from "node:net";
import tls from "node:tls";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const sqlPath = new URL("../prisma/schema.sql", import.meta.url);
const sql = await fs.readFile(sqlPath, "utf8");
const url = new URL(databaseUrl);
const host = url.hostname;
const port = Number(url.port || 5432);
const user = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
const database = url.pathname.slice(1);

let socket = await connectTls(host, port);
let buffer = Buffer.alloc(0);
let backendKeyData;

sendStartup({ user, database });
await authenticate();
await runQuery(sql);
await end();

console.log("Schema applied successfully");

function connectTls(hostname, portNumber) {
  return new Promise((resolve, reject) => {
    const raw = net.connect(portNumber, hostname);
    raw.once("error", reject);
    raw.once("connect", () => {
      const req = Buffer.alloc(8);
      req.writeInt32BE(8, 0);
      req.writeInt32BE(80877103, 4);
      raw.write(req);
    });
    raw.once("data", (chunk) => {
      if (chunk.toString("utf8") !== "S") {
        reject(new Error("PostgreSQL server did not accept SSL"));
        return;
      }
      const secure = tls.connect({ socket: raw, servername: hostname, rejectUnauthorized: false });
      secure.once("secureConnect", () => resolve(secure));
      secure.once("error", reject);
    });
  });
}

function sendStartup(params) {
  const parts = [];
  const body = [];
  body.push(int32(196608));
  for (const [key, value] of Object.entries({ ...params, client_encoding: "UTF8" })) {
    body.push(cstr(key), cstr(value));
  }
  body.push(Buffer.from([0]));
  const payload = Buffer.concat(body);
  parts.push(int32(payload.length + 4), payload);
  socket.write(Buffer.concat(parts));
}

async function authenticate() {
  let scram = null;
  while (true) {
    const msg = await readMessage();
    if (msg.type === "R") {
      const code = msg.payload.readInt32BE(0);
      if (code === 0) continue;
      if (code === 3) {
        sendPassword(password);
        continue;
      }
      if (code === 5) {
        const salt = msg.payload.subarray(4, 8);
        const inner = crypto.createHash("md5").update(password + user).digest("hex");
        sendPassword("md5" + crypto.createHash("md5").update(Buffer.concat([Buffer.from(inner), salt])).digest("hex"));
        continue;
      }
      if (code === 10) {
        scram = startScram();
        sendSaslInitial(scram.clientFirstMessage);
        continue;
      }
      if (code === 11 && scram) {
        const serverFirst = msg.payload.subarray(4).toString("utf8");
        const clientFinal = finishScram(scram, serverFirst);
        sendSaslResponse(clientFinal);
        continue;
      }
      if (code === 12) continue;
      throw new Error(`Unsupported auth code ${code}`);
    }
    if (msg.type === "S" || msg.type === "K" || msg.type === "N") {
      if (msg.type === "K") backendKeyData = msg.payload;
      continue;
    }
    if (msg.type === "Z") return;
    if (msg.type === "E") throw new Error(parseError(msg.payload));
  }
}

async function runQuery(query) {
  sendMessage("Q", Buffer.from(`${query}\0`));
  while (true) {
    const msg = await readMessage();
    if (msg.type === "E") throw new Error(parseError(msg.payload));
    if (msg.type === "Z") return;
  }
}

async function end() {
  sendMessage("X", Buffer.alloc(0));
  socket.end();
}

function startScram() {
  const nonce = crypto.randomBytes(18).toString("base64");
  const clientFirstBare = `n=${escapeScram(user)},r=${nonce}`;
  return {
    nonce,
    clientFirstBare,
    clientFirstMessage: `n,,${clientFirstBare}`
  };
}

function finishScram(state, serverFirst) {
  const parsed = Object.fromEntries(serverFirst.split(",").map((part) => [part[0], part.slice(2)]));
  const iterations = Number(parsed.i);
  const salt = Buffer.from(parsed.s, "base64");
  const salted = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const clientKey = hmac(salted, "Client Key");
  const storedKey = crypto.createHash("sha256").update(clientKey).digest();
  const clientFinalWithoutProof = `c=biws,r=${parsed.r}`;
  const authMessage = `${state.clientFirstBare},${serverFirst},${clientFinalWithoutProof}`;
  const clientSignature = hmac(storedKey, authMessage);
  const proof = xor(clientKey, clientSignature).toString("base64");
  return `${clientFinalWithoutProof},p=${proof}`;
}

function hmac(key, text) {
  return crypto.createHmac("sha256", key).update(text).digest();
}

function xor(a, b) {
  const out = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i += 1) out[i] = a[i] ^ b[i];
  return out;
}

function escapeScram(value) {
  return value.replaceAll("=", "=3D").replaceAll(",", "=2C");
}

function sendPassword(value) {
  sendMessage("p", Buffer.from(`${value}\0`));
}

function sendSaslInitial(clientFirst) {
  const mechanism = cstr("SCRAM-SHA-256");
  const initial = Buffer.from(clientFirst);
  sendMessage("p", Buffer.concat([mechanism, int32(initial.length), initial]));
}

function sendSaslResponse(clientFinal) {
  sendMessage("p", Buffer.from(clientFinal));
}

function sendMessage(type, payload) {
  socket.write(Buffer.concat([Buffer.from(type), int32(payload.length + 4), payload]));
}

async function readMessage() {
  while (buffer.length < 5) buffer = Buffer.concat([buffer, await readChunk()]);
  const type = buffer.subarray(0, 1).toString("utf8");
  const length = buffer.readInt32BE(1);
  while (buffer.length < 1 + length) buffer = Buffer.concat([buffer, await readChunk()]);
  const payload = buffer.subarray(5, 1 + length);
  buffer = buffer.subarray(1 + length);
  return { type, payload };
}

function readChunk() {
  return new Promise((resolve, reject) => {
    socket.once("data", resolve);
    socket.once("error", reject);
  });
}

function parseError(payload) {
  const fields = {};
  let index = 0;
  while (index < payload.length && payload[index] !== 0) {
    const code = String.fromCharCode(payload[index]);
    index += 1;
    const end = payload.indexOf(0, index);
    fields[code] = payload.subarray(index, end).toString("utf8");
    index = end + 1;
  }
  return fields.M || "PostgreSQL error";
}

function int32(value) {
  const buf = Buffer.alloc(4);
  buf.writeInt32BE(value, 0);
  return buf;
}

function cstr(value) {
  return Buffer.from(`${value}\0`);
}
