import { saveConfig, CONFIG_FILE } from "../lib/config.js";
import { getClient } from "../lib/client.js";
import * as readline from "readline";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export interface InitOptions {
  apiKey?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  console.log("Utter - ElevenLabs TTS CLI Setup");
  console.log("==============================");
  console.log("");

  let apiKey = options.apiKey;

  if (!apiKey) {
    console.log("Get your API key at: https://elevenlabs.io/app/settings/api-keys");
    console.log("");
    apiKey = await prompt("Enter your ElevenLabs API key: ");
  }

  if (!apiKey || !apiKey.trim()) {
    console.error("Error: API key is required.");
    process.exit(1);
  }

  apiKey = apiKey.trim();

  console.log("");
  console.log("Validating API key...");

  try {
    const client = getClient(apiKey);
    const voices = await client.voices.getAll();
    console.log(`Success! Found ${voices.voices?.length || 0} voices available.`);
  } catch (error) {
    console.error("Error: Invalid API key or connection failed.");
    console.error((error as Error).message);
    process.exit(1);
  }

  await saveConfig({ apiKey });

  console.log("");
  console.log(`Configuration saved to: ${CONFIG_FILE}`);
  console.log("");
  console.log("You're all set! Try these commands:");
  console.log("  utter voices            - List available voices");
  console.log("  utter me 'Hello!'       - Speak text aloud");
  console.log("  utter to out.mp3 'Hi'   - Save to file");
  console.log("");
}
