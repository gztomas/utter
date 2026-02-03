import { readFile } from "fs/promises";
import { requireApiKey, loadConfig } from "../lib/config.js";
import { textToSpeech, splitTextIntoChunks, listVoices } from "../lib/client.js";
import { playAudio, saveAudio } from "../lib/player.js";

const FALLBACK_VOICE = "cgSgspJ2msm6clMCkdW9";

export interface SpeakOptions {
  file?: string;
  voice?: string;
  model?: string;
  stream?: boolean;
  quiet?: boolean;
  output?: string;
}

export async function speakCommand(textArgs: string[], options: SpeakOptions): Promise<void> {
  const apiKey = await requireApiKey();
  const config = await loadConfig();

  let text: string | undefined;
  if (options.file) {
    text = await readFile(options.file, "utf-8");
  } else if (textArgs.length > 0) {
    text = textArgs.join(" ");
  } else if (!process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    text = Buffer.concat(chunks).toString("utf-8");
  }

  if (!text || !text.trim()) {
    console.error("Error: No text provided.");
    console.error("");
    console.error("Usage:");
    console.error("  utter me 'Hello world'");
    console.error("  utter me --file input.txt");
    console.error("  echo 'Hello' | utter me");
    process.exit(1);
  }

  text = text.trim();

  let voiceId = options.voice || config.defaultVoice || FALLBACK_VOICE;

  if (voiceId && !voiceId.match(/^[a-zA-Z0-9]{20,}$/)) {
    const voices = await listVoices(apiKey);
    const match = voices.find(
      (v) => v.name?.toLowerCase().includes(voiceId!.toLowerCase())
    );
    if (match && match.voiceId) {
      voiceId = match.voiceId;
    }
  }

  const modelId = options.model || config.defaultModel || "eleven_multilingual_v2";

  const chunks = splitTextIntoChunks(text);
  const isLong = chunks.length > 1;

  if (isLong && !options.quiet) {
    console.log(`Text split into ${chunks.length} parts`);
  }

  const allBuffers: Buffer[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (isLong && !options.quiet) {
      console.log(`Processing part ${i + 1}/${chunks.length}...`);
    }

    const buffer = await textToSpeech(apiKey, chunks[i], voiceId, modelId);
    allBuffers.push(buffer);

    if (!options.output && options.stream) {
      await playAudio(buffer);
    }
  }

  const combinedBuffer = Buffer.concat(allBuffers);

  if (options.output) {
    await saveAudio(combinedBuffer, options.output);
    if (!options.quiet) {
      console.log(`Saved to: ${options.output}`);
    }
  } else if (!options.stream) {
    await playAudio(combinedBuffer);
  }
}
