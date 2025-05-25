import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function getCpuUsage() {
  const cpus = os.cpus();
  return cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const usage = 100 - (100 * cpu.times.idle) / total;
    return usage.toFixed(1);
  });
}

async function getCpuTemp() {
  const { stdout } = await execAsync("vcgencmd measure_temp");
  return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
}

function bytesToGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

async function getTopProcesses(limit = 5) {
  const { stdout } = await execAsync(
    `ps -eo pid,comm,args,%cpu,%mem --sort=-%cpu | head -n ${limit + 1}`
  );

  const lines = stdout.trim().split("\n");
  const dataLines = lines.slice(1);

  return dataLines.map(line => {
    const tokens = line.trim().split(/\s+/);

    const pid = parseInt(tokens[0], 10);
    const command = tokens[1];
    const cpu = parseFloat(tokens[tokens.length - 2]);
    const memory = parseFloat(tokens[tokens.length - 1]);

    const fullCommand = tokens.slice(2, tokens.length - 2).join(" ");

    return {
      pid,
      command,
      fullCommand,
      cpu,
      memory,
    };
  });
}




async function getDiskUsage() {
  const { stdout } = await execAsync("df -h /");
  const lines = stdout.trim().split("\n");

  if (lines.length < 2) throw new Error("Unexpected df output");

  const headers = lines[0].split(/\s+/);
  const values = lines[1].split(/\s+/);

  const diskInfo: Record<string, string> = {};
  headers.forEach((header, i) => {
    diskInfo[header] = values[i];
  });

  const parseNumber = (value: string) => parseFloat(value.replace(/[A-Za-z]/g, ""));

  return {
    filesystem: diskInfo["Filesystem"],
    size: parseNumber(diskInfo["Size"]),
    used: parseNumber(diskInfo["Used"]),
    available: parseNumber(diskInfo["Avail"]),
    usePercent: parseFloat(diskInfo["Use%"].replace("%", "")),
    mount: diskInfo["Mounted"],
  };
}



export async function getSystemDetails() {
  // Get CPU usage
  const cpuUsage = getCpuUsage();

  // Get memory info
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
 
  const cpuTemp = await getCpuTemp();
  const diskUsage = await getDiskUsage();
  const topProcesses = await getTopProcesses();

  return {
    os,
    cpuTemp,
    cpuUsage,
    memoryUsage: {
      total: parseFloat(bytesToGB(totalMem)),
      used: parseFloat(bytesToGB(usedMem)),
      free: parseFloat(bytesToGB(freeMem)),
    },
    loadAverage: os.loadavg(),
    uptime: os.uptime(),
    diskUsage: diskUsage,
    topProcesses: topProcesses
  };
}
