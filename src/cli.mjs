#!/usr/bin/env node

import { Command } from "commander";
import { config as loadEnv } from "dotenv";
import { initCommand } from "./commands/init.mjs";
import { voicesCommand } from "./commands/voices.mjs";
import { speakCommand } from "./commands/speak.mjs";

// Load .env file if present
loadEnv();

const program = new Command();

program
  .name("voz")
  .description("Text-to-Speech CLI using ElevenLabs - designed for humans and AI agents")
  .version("1.0.0");

// Init command
program
  .command("init")
  .description("Initialize Voz with your ElevenLabs API key")
  .option("-k, --api-key <key>", "API key (or enter interactively)")
  .action(initCommand);

// Voices command
program
  .command("voices")
  .description("List available voices")
  .option("--json", "Output as JSON (useful for agents)")
  .option("--set-default <voice-id>", "Set the default voice")
  .action(voicesCommand);

// Speak command
program
  .command("speak")
  .description("Convert text to speech")
  .argument("[text...]", "Text to speak")
  .option("-f, --file <path>", "Read text from file")
  .option("-o, --output <path>", "Save audio to file instead of playing")
  .option("-v, --voice <voice>", "Voice ID or name to use")
  .option("-m, --model <model>", "Model ID (default: eleven_multilingual_v2)")
  .option("-s, --stream", "Stream audio chunks as they're ready (for long text)")
  .option("-q, --quiet", "Suppress progress output")
  .action(speakCommand);

// Default action - if just text is provided, speak it
program
  .argument("[text...]", "Text to speak (shortcut for 'voz speak')")
  .action(async (text, options, command) => {
    // If subcommand was used, don't do anything here
    if (command.args.length === 0) {
      program.help();
      return;
    }

    // Check if first arg is a subcommand
    const subcommands = ["init", "voices", "speak", "help"];
    if (subcommands.includes(command.args[0])) {
      return; // Let the subcommand handle it
    }

    // Otherwise treat as speak command
    await speakCommand(command.args, {});
  });

// Help examples for agents
program.addHelpText(
  "after",
  `
Examples:
  $ voz init                          # Set up your API key
  $ voz speak "Hello world"           # Speak text aloud
  $ voz speak -f article.txt          # Speak text from file
  $ voz speak "Hello" -o hello.mp3    # Save to MP3 file
  $ voz speak -v Rachel "Hello"       # Use a specific voice
  $ voz voices                         # List all available voices
  $ voz voices --json                  # List voices as JSON (for agents)
  $ echo "Hello" | voz speak          # Pipe text to speak

Agent Integration:
  This CLI is designed to be easily used by AI agents.
  Use --json flag for machine-readable output.
  Use --quiet flag to suppress progress messages.
  Exit codes: 0 = success, 1 = error

Environment Variables:
  ELEVENLABS_API_KEY    Your ElevenLabs API key
  VOZ_DEFAULT_VOICE     Default voice ID to use
`
);

program.parse();
