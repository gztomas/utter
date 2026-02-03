import { requireApiKey, loadConfig, saveConfig } from "../lib/config.js";
import { listVoices, getVoice } from "../lib/client.js";
import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";

export interface VoicesOptions {
  json?: boolean;
  setDefault?: string;
}

export async function voicesCommand(options: VoicesOptions): Promise<void> {
  const apiKey = await requireApiKey();

  if (options.setDefault) {
    await setDefaultVoice(apiKey, options.setDefault);
    return;
  }

  console.log("Fetching available voices...");
  console.log("");

  const voices = await listVoices(apiKey);
  const config = await loadConfig();

  if (options.json) {
    console.log(JSON.stringify(voices, null, 2));
    return;
  }

  const premade = voices.filter((v) => v.category === "premade");
  const cloned = voices.filter((v) => v.category === "cloned");
  const generated = voices.filter((v) => v.category === "generated");
  const other = voices.filter(
    (v) => !["premade", "cloned", "generated"].includes(v.category || "")
  );

  const printVoice = (voice: ElevenLabs.Voice): void => {
    const isDefault = config.defaultVoice === voice.voiceId;
    const defaultMark = isDefault ? " (default)" : "";
    const labels = voice.labels || {};
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");

    console.log(`  ${voice.name}${defaultMark}`);
    console.log(`    ID: ${voice.voiceId}`);
    if (labelStr) {
      console.log(`    Labels: ${labelStr}`);
    }
    console.log("");
  };

  if (premade.length > 0) {
    console.log("Premade Voices:");
    console.log("---------------");
    premade.forEach(printVoice);
  }

  if (cloned.length > 0) {
    console.log("Cloned Voices:");
    console.log("--------------");
    cloned.forEach(printVoice);
  }

  if (generated.length > 0) {
    console.log("Generated Voices:");
    console.log("-----------------");
    generated.forEach(printVoice);
  }

  if (other.length > 0) {
    console.log("Other Voices:");
    console.log("-------------");
    other.forEach(printVoice);
  }

  console.log(`Total: ${voices.length} voices`);
  console.log("");
  console.log("Set a default voice with: utter voices --set-default <voice-id>");
}

async function setDefaultVoice(apiKey: string, voiceId: string): Promise<void> {
  try {
    const voice = await getVoice(apiKey, voiceId);
    await saveConfig({ defaultVoice: voice.voiceId });
    console.log(`Default voice set to: ${voice.name} (${voice.voiceId})`);
  } catch {
    console.error(`Error: Voice "${voiceId}" not found.`);
    console.error("Run 'utter voices' to see available voices.");
    process.exit(1);
  }
}
