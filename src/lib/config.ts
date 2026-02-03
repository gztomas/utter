import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export const CONFIG_DIR = join(homedir(), ".utter");
export const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface Config {
  apiKey: string | null;
  defaultVoice: string | null;
  defaultModel: string;
}

const defaultConfig: Config = {
  apiKey: null,
  defaultVoice: null,
  defaultModel: "eleven_multilingual_v2",
};

export async function ensureConfigDir(): Promise<void> {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }
}

export async function loadConfig(): Promise<Config> {
  await ensureConfigDir();

  const envApiKey = process.env.ELEVENLABS_API_KEY;
  const envVoice = process.env.UTTER_DEFAULT_VOICE;

  let fileConfig: Config = { ...defaultConfig };

  if (existsSync(CONFIG_FILE)) {
    try {
      const content = await readFile(CONFIG_FILE, "utf-8");
      fileConfig = { ...defaultConfig, ...JSON.parse(content) };
    } catch {
      // Ignore parse errors, use defaults
    }
  }

  return {
    ...fileConfig,
    apiKey: envApiKey || fileConfig.apiKey,
    defaultVoice: envVoice || fileConfig.defaultVoice,
  };
}

export async function saveConfig(config: Partial<Config>): Promise<Config> {
  await ensureConfigDir();
  const current = await loadConfig();
  const merged = { ...current, ...config };
  await writeFile(CONFIG_FILE, JSON.stringify(merged, null, 2));
  return merged;
}

export async function getApiKey(): Promise<string | null> {
  const config = await loadConfig();
  return config.apiKey;
}

export async function requireApiKey(): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error("Error: No API key configured.");
    console.error("");
    console.error("Set up your API key using one of these methods:");
    console.error("  1. Run: utter init");
    console.error("  2. Set environment variable: ELEVENLABS_API_KEY=your_key");
    console.error("  3. Create a .env file with ELEVENLABS_API_KEY=your_key");
    console.error("");
    console.error(
      "Get your API key at: https://elevenlabs.io/app/settings/api-keys"
    );
    process.exit(1);
  }
  return apiKey;
}
