import { exec } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function playAudio(buffer) {
  const tmpFile = join(tmpdir(), `voz-${Date.now()}.mp3`);
  await writeFile(tmpFile, buffer);

  try {
    // macOS
    if (process.platform === "darwin") {
      await execAsync(`afplay "${tmpFile}"`);
    }
    // Linux
    else if (process.platform === "linux") {
      // Try different players
      try {
        await execAsync(`mpv --no-video "${tmpFile}"`);
      } catch {
        try {
          await execAsync(`ffplay -nodisp -autoexit "${tmpFile}"`);
        } catch {
          await execAsync(`aplay "${tmpFile}"`);
        }
      }
    }
    // Windows
    else if (process.platform === "win32") {
      await execAsync(`powershell -c "(New-Object Media.SoundPlayer '${tmpFile}').PlaySync()"`);
    }
  } finally {
    await unlink(tmpFile).catch(() => {});
  }
}

export async function saveAudio(buffer, outputPath) {
  await writeFile(outputPath, buffer);
}
