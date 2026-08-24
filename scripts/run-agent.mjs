import { spawnSync } from "node:child_process";
import process from "node:process";

const command = process.platform === "win32"
  ? ["powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "scripts/run-agent.ps1", ...process.argv.slice(2)]]
  : ["bash", ["scripts/run-agent.sh", ...process.argv.slice(2)]];

const result = spawnSync(command[0], command[1], { stdio: "inherit", cwd: process.cwd() });
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
