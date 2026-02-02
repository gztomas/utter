import { requireApiKey, loadConfig, saveConfig } from "../lib/config.mjs";
import { listVoices, getVoice } from "../lib/client.mjs";

export async function voicesCommand(options) {
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

  // Group by category
  const premade = voices.filter((v) => v.category === "premade");
  const cloned = voices.filter((v) => v.category === "cloned");
  const generated = voices.filter((v) => v.category === "generated");
  const other = voices.filter(
    (v) => !["premade", "cloned", "generated"].includes(v.category)
  );

  const printVoice = (voice) => {
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
  console.log("Set a default voice with: voz voices --set-default <voice-id>");
}

async function setDefaultVoice(apiKey, voiceId) {
  try {
    // Validate the voice exists
    const voice = await getVoice(apiKey, voiceId);
    await saveConfig({ defaultVoice: voice.voiceId });
    console.log(`Default voice set to: ${voice.name} (${voice.voiceId})`);
  } catch (error) {
    console.error(`Error: Voice "${voiceId}" not found.`);
    console.error("Run 'voz voices' to see available voices.");
    process.exit(1);
  }
}
