import { readFile } from "fs/promises";
import { requireApiKey, loadConfig } from "../lib/config.mjs";
import { textToSpeech, splitTextIntoChunks, listVoices } from "../lib/client.mjs";
import { playAudio, saveAudio } from "../lib/player.mjs";

// Default voice if none configured
const FALLBACK_VOICE = "cgSgspJ2msm6clMCkdW9";

export async function speakCommand(textArgs, options) {
  const apiKey = await requireApiKey();
  const config = await loadConfig();

  // Get text from arguments or file
  let text;
  if (options.file) {
    text = await readFile(options.file, "utf-8");
  } else if (textArgs.length > 0) {
    text = textArgs.join(" ");
  } else if (!process.stdin.isTTY) {
    // Read from stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    text = Buffer.concat(chunks).toString("utf-8");
  }

  if (!text || !text.trim()) {
    console.error("Error: No text provided.");
    console.error("");
    console.error("Usage:");
    console.error("  voz speak 'Hello world'");
    console.error("  voz speak --file input.txt");
    console.error("  echo 'Hello' | voz speak");
    process.exit(1);
  }

  text = text.trim();

  // Resolve voice
  let voiceId = options.voice || config.defaultVoice || FALLBACK_VOICE;

  // If voice is a name instead of ID, try to resolve it
  if (voiceId && !voiceId.match(/^[a-zA-Z0-9]{20,}$/)) {
    const voices = await listVoices(apiKey);
    const match = voices.find(
      (v) => v.name.toLowerCase().includes(voiceId.toLowerCase())
    );
    if (match) {
      voiceId = match.voiceId;
    }
  }

  const modelId = options.model || config.defaultModel || "eleven_multilingual_v2";

  // Split long text into chunks
  const chunks = splitTextIntoChunks(text);
  const isLong = chunks.length > 1;

  if (isLong && !options.quiet) {
    console.log(`Text split into ${chunks.length} parts`);
  }

  const allBuffers = [];

  for (let i = 0; i < chunks.length; i++) {
    if (isLong && !options.quiet) {
      console.log(`Processing part ${i + 1}/${chunks.length}...`);
    }

    const buffer = await textToSpeech(apiKey, chunks[i], voiceId, modelId);
    allBuffers.push(buffer);

    // If playing (not saving) and streaming, play each chunk
    if (!options.output && options.stream) {
      await playAudio(buffer);
    }
  }

  const combinedBuffer = Buffer.concat(allBuffers);

  // Output or play
  if (options.output) {
    await saveAudio(combinedBuffer, options.output);
    if (!options.quiet) {
      console.log(`Saved to: ${options.output}`);
    }
  } else if (!options.stream) {
    // Play all at once (default behavior)
    await playAudio(combinedBuffer);
  }

  if (!options.quiet && !options.output) {
    // Nothing to print, audio played
  }
}
