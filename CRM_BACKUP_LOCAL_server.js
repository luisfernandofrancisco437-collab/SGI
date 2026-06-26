const http = require("http");
const fs = require("fs");
const path = require("path");

const backupDir = "C:\\CRM_BACKUPS";
fs.mkdirSync(backupDir, { recursive: true });

function safeName(name) {
  const fallback = "backup_crm_" + new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14) + ".json";
  name = String(name || fallback).replace(/[\\/:*?"<>|]/g, "_");
  if (!/\.json$/i.test(name)) name += ".json";
  return name;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, pasta: backupDir }));
    return;
  }

  if (req.method !== "POST" || req.url.split("?")[0] !== "/backup") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  let body = "";
  req.setEncoding("utf8");
  req.on("data", chunk => {
    body += chunk;
    if (body.length > 80 * 1024 * 1024) req.destroy();
  });
  req.on("end", () => {
    try {
      const payload = JSON.parse(body || "{}");
      const nome = safeName(payload.nome);
      const conteudo = typeof payload.conteudo === "string" ? payload.conteudo : JSON.stringify(payload.conteudo || {}, null, 2);
      const destino = path.join(backupDir, nome);
      fs.writeFileSync(destino, conteudo, "utf8");
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: true, arquivo: destino }));
      console.log("Backup salvo:", destino);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, erro: err.message }));
    }
  });
});

server.listen(8787, "127.0.0.1", () => {
  console.log("Backup local do CRM ativo em http://127.0.0.1:8787");
  console.log("Pasta de destino:", backupDir);
});
