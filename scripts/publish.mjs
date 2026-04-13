import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const publishDir = path.join(projectRoot, "publish");

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureEmptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  fs.cpSync(src, dest, { recursive: true, force: true });
}

function copyFileIfExists(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function writeFile(dest, content) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, "utf8");
}

if (process.platform === "win32") {
  run("cmd.exe", ["/d", "/s", "/c", "npm", "run", "build"]);
} else {
  run("npm", ["run", "build"]);
}

const standaloneDir = path.join(projectRoot, ".next", "standalone");
const staticDir = path.join(projectRoot, ".next", "static");
const publicDir = path.join(projectRoot, "public");

if (!fs.existsSync(standaloneDir)) {
  console.error("Publish error: .next/standalone bulunamadı. next.config içinde output:'standalone' olmalı.");
  process.exit(1);
}

ensureEmptyDir(publishDir);

// Standalone server (server.js + minimal node_modules tree)
copyDir(standaloneDir, publishDir);

// Next static assets
if (fs.existsSync(staticDir)) {
  copyDir(staticDir, path.join(publishDir, ".next", "static"));
}

// Public assets
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, path.join(publishDir, "public"));
}

// Env files (optional)
copyFileIfExists(path.join(projectRoot, ".env"), path.join(publishDir, ".env"));
copyFileIfExists(path.join(projectRoot, ".env.local"), path.join(publishDir, ".env.local"));
copyFileIfExists(path.join(projectRoot, ".env.production"), path.join(publishDir, ".env.production"));
copyFileIfExists(path.join(projectRoot, ".env.production.local"), path.join(publishDir, ".env.production.local"));

// PM2 config (optional)
copyFileIfExists(path.join(projectRoot, "ecosystem.config.cjs"), path.join(publishDir, "ecosystem.config.cjs"));

// IIS reverse-proxy (URL Rewrite + ARR required) -> Node server.js (PORT)
const iisTargetPort = process.env.IIS_TARGET_PORT || "8461";
writeFile(
  path.join(publishDir, "web.config"),
  `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <httpErrors existingResponse="PassThrough" />
    <security>
      <requestFiltering allowDoubleEscaping="true" />
    </security>
    <rewrite>
      <rules>
        <rule name="ReverseProxyToNode" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://127.0.0.1:${iisTargetPort}/{R:1}" />
          <serverVariables>
            <set name="HTTP_X_FORWARDED_PROTO" value="https" />
          </serverVariables>
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
`
);

console.log(`Publish tamamlandı: ${publishDir}`);
