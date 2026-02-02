import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

let clientInstance = null;

export function getClient(apiKey) {
  if (!clientInstance || clientInstance._apiKey !== apiKey) {
    clientInstance = new ElevenLabsClient({ apiKey });
    clientInstance._apiKey = apiKey;
  }
  return clientInstance;
}

export async function textToSpeech(apiKey, text, voiceId, modelId = "eleven_multilingual_v2") {
  const client = getClient(apiKey);
  const audio = await client.textToSpeech.convert(voiceId, {
    text,
    model_id: modelId,
  });

  const chunks = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function listVoices(apiKey) {
  const client = getClient(apiKey);
  const response = await client.voices.getAll();
  return response.voices || [];
}

export async function getVoice(apiKey, voiceId) {
  const client = getClient(apiKey);
  return await client.voices.get(voiceId);
}

export function splitTextIntoChunks(text, maxLen = 4500) {
  const chunks = [];
  let current = "";
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + " " + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
