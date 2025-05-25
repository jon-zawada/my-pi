import { getSystemDetails } from "@/lib/system";
import { formatUptime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function Home() {
  const systemInfo = await getSystemDetails();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Raspberry Pi</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {[
              ["Hostname", systemInfo.os.hostname()],
              ["Platform", systemInfo.os.platform()],
              ["Architecture", systemInfo.os.arch()],
              ["CPU Temperature", `${systemInfo.cpuTemp.toFixed(1)}°C`],
              ["Uptime", formatUptime(systemInfo.uptime)]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}:</span>
                <span className="text-foreground font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">CPU Usage</h3>
            {systemInfo.cpuUsage.map((usage: string, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Core {index}</span>
                  <span>{usage}%</span>
                </div>
                <Progress value={parseFloat(usage)} className="h-2" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Memory Usage</h3>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Used</span>
              <span>{systemInfo.memoryUsage.used.toFixed(2)} / {systemInfo.memoryUsage.total.toFixed(2)} GB</span>
            </div>
            <Progress
              value={(systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100}
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Disk Usage</h3>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Used</span>
              <span>{systemInfo.diskUsage.used.toFixed(2)} / {systemInfo.diskUsage.size.toFixed(2)} GB</span>
            </div>
            <Progress
              value={(systemInfo.diskUsage.used / systemInfo.diskUsage.size) * 100}
              className="h-2"
            />
            <div className="space-y-2">
              {[
                ["Available", `${systemInfo.diskUsage.available} GB`],
                ["Filesystem", systemInfo.diskUsage.filesystem],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}:</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Top Processes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PID</TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead>Full Command</TableHead>
                  <TableHead>CPU %</TableHead>
                  <TableHead>Memory %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemInfo.topProcesses.map(({ pid, command, fullCommand, cpu, memory }) => (
                  <TableRow key={pid}>
                    <TableCell>{pid}</TableCell>
                    <TableCell>{command}</TableCell>
                    <TableCell>{fullCommand}</TableCell>
                    <TableCell>{cpu.toFixed(1)}</TableCell>
                    <TableCell>{memory.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}