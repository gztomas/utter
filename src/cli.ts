#!/usr/bin/env node

import { Command } from "commander";
import { config as loadEnv } from "dotenv";
import { initCommand } from "./commands/init.js";
import { voicesCommand } from "./commands/voices.js";
import { speakCommand } from "./commands/speak.js";

loadEnv();

const program = new Command();

program
  .name("utter")
  .description("Text-to-Speech CLI using ElevenLabs - designed for humans and AI agents")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize utter with your ElevenLabs API key")
  .option("-k, --api-key <key>", "API key (or enter interactively)")
  .action(initCommand);

program
  .command("voices")
  .description("List available voices")
  .option("--json", "Output as JSON (useful for agents)")
  .option("--set-default <voice-id>", "Set the default voice")
  .action(voicesCommand);

program
  .command("me")
  .description("Speak text aloud")
  .argument("[text...]", "Text to speak")
  .option("-f, --file <path>", "Read text from file")
  .option("-v, --voice <voice>", "Voice ID or name to use")
  .option("-m, --model <model>", "Model ID (default: eleven_multilingual_v2)")
  .option("-s, --stream", "Stream audio chunks as they're ready (for long text)")
  .option("-q, --quiet", "Suppress progress output")
  .action((text: string[], options) => speakCommand(text, { ...options, output: undefined }));

program
  .command("to")
  .description("Save speech to audio file")
  .argument("<output>", "Output file path (e.g., hello.mp3)")
  .argument("[text...]", "Text to speak")
  .option("-f, --file <path>", "Read text from file")
  .option("-v, --voice <voice>", "Voice ID or name to use")
  .option("-m, --model <model>", "Model ID (default: eleven_multilingual_v2)")
  .option("-q, --quiet", "Suppress progress output")
  .action((output: string, text: string[], options) => speakCommand(text, { ...options, output }));

program
  .action(() => {
    program.help();
  });

program.addHelpText(
  "after",
  `
Examples:
  $ utter init                        # Set up your API key
  $ utter me "Hello world"            # Speak text aloud
  $ utter me -f article.txt           # Speak text from file
  $ utter to hello.mp3 "Hello"        # Save to MP3 file
  $ utter me -v Rachel "Hello"        # Use a specific voice
  $ utter voices                      # List all available voices
  $ utter voices --json               # List voices as JSON (for agents)
  $ echo "Hello" | utter me           # Pipe text to speak

Agent Integration:
  This CLI is designed to be easily used by AI agents.
  Use --json flag for machine-readable output.
  Use --quiet flag to suppress progress messages.
  Exit codes: 0 = success, 1 = error

Environment Variables:
  ELEVENLABS_API_KEY    Your ElevenLabs API key
  UTTER_DEFAULT_VOICE   Default voice ID to use

Get your API key at: https://elevenlabs.io/app/settings/api-keys
`
);

program.parse();
