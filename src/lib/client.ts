import { ElevenLabsClient, ElevenLabs } from "@elevenlabs/elevenlabs-js";

interface ExtendedClient extends ElevenLabsClient {
  _apiKey?: string;
}

let clientInstance: ExtendedClient | null = null;

export function getClient(apiKey: string): ExtendedClient {
  if (!clientInstance || clientInstance._apiKey !== apiKey) {
    clientInstance = new ElevenLabsClient({ apiKey }) as ExtendedClient;
    clientInstance._apiKey = apiKey;
  }
  return clientInstance;
}

export async function textToSpeech(
  apiKey: string,
  text: string,
  voiceId: string,
  modelId: string = "eleven_multilingual_v2"
): Promise<Buffer> {
  const client = getClient(apiKey);
  const audio = await client.textToSpeech.convert(voiceId, {
    text,
    modelId,
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audio) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function listVoices(apiKey: string): Promise<ElevenLabs.Voice[]> {
  const client = getClient(apiKey);
  const response = await client.voices.getAll();
  return response.voices || [];
}

export async function getVoice(apiKey: string, voiceId: string): Promise<ElevenLabs.Voice> {
  const client = getClient(apiKey);
  return await client.voices.get(voiceId);
}

export function splitTextIntoChunks(text: string, maxLen: number = 4500): string[] {
  const chunks: string[] = [];
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
