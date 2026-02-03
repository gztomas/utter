import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".utter");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

const defaultConfig = {
  apiKey: null,
  defaultVoice: null,
  defaultModel: "eleven_multilingual_v2",
};

export async function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }
}

export async function loadConfig() {
  await ensureConfigDir();

  // First check environment variables
  const envApiKey = process.env.ELEVENLABS_API_KEY;
  const envVoice = process.env.UTTER_DEFAULT_VOICE;

  let fileConfig = { ...defaultConfig };

  if (existsSync(CONFIG_FILE)) {
    try {
      const content = await readFile(CONFIG_FILE, "utf-8");
      fileConfig = { ...defaultConfig, ...JSON.parse(content) };
    } catch {
      // Ignore parse errors, use defaults
    }
  }

  // Environment variables take precedence
  return {
    ...fileConfig,
    apiKey: envApiKey || fileConfig.apiKey,
    defaultVoice: envVoice || fileConfig.defaultVoice,
  };
}

export async function saveConfig(config) {
  await ensureConfigDir();
  const current = await loadConfig();
  const merged = { ...current, ...config };
  await writeFile(CONFIG_FILE, JSON.stringify(merged, null, 2));
  return merged;
}

export async function getApiKey() {
  const config = await loadConfig();
  return config.apiKey;
}

export async function requireApiKey() {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error("Error: No API key configured.");
    console.error("");
    console.error("Set up your API key using one of these methods:");
    console.error("  1. Run: utter init");
    console.error("  2. Set environment variable: ELEVENLABS_API_KEY=your_key");
    console.error("  3. Create a .env file with ELEVENLABS_API_KEY=your_key");
    console.error("");
    console.error("Get your API key at: https://elevenlabs.io/app/settings/api-keys");
    process.exit(1);
  }
  return apiKey;
}

export { CONFIG_DIR, CONFIG_FILE };
