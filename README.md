# Utter

A Text-to-Speech CLI using ElevenLabs, designed for humans and AI agents.

Give your AI agent a voice. Utter converts text to speech from the terminal — use it manually, let your agent call it as a tool, or wire it up as a hook so every response is spoken aloud automatically.

## Installation

```bash
npm install -g utter-cli
```

Or install from source:

```bash
git clone https://github.com/gztomas/utter.git
cd utter
npm install && npm run build
npm install -g .
```

## Setup

Get your API key from [ElevenLabs](https://elevenlabs.io/app/settings/api-keys), then:

```bash
utter init
```

Or set it via environment variable:

```bash
export ELEVENLABS_API_KEY=your_key_here
```

## Usage

### Speak text aloud

```bash
utter me "Hello, world!"
```

### Speak from a file

```bash
utter me --file article.txt
```

### Save to MP3

```bash
utter to hello.mp3 "Hello"
```

### Use a specific voice

```bash
utter me --voice Rachel "Hello there!"
```

### Pipe text

```bash
echo "Hello from stdin" | utter me
cat document.txt | utter me
```

### List available voices

```bash
utter voices
```

### Set default voice

```bash
utter voices --set-default <voice-id>
```

## Options

### `utter me`

| Option | Description |
|--------|-------------|
| `-f, --file <path>` | Read text from file |
| `-v, --voice <voice>` | Voice ID or name |
| `-m, --model <model>` | Model ID (default: `eleven_multilingual_v2`) |
| `-s, --stream` | Stream audio chunks as they're ready |
| `-q, --quiet` | Suppress progress output |

### `utter to <file>`

| Option | Description |
|--------|-------------|
| `-f, --file <path>` | Read text from file |
| `-v, --voice <voice>` | Voice ID or name |
| `-m, --model <model>` | Model ID (default: `eleven_multilingual_v2`) |
| `-q, --quiet` | Suppress progress output |

### `utter voices`

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--set-default <id>` | Set the default voice |

## Use with AI agents

There are two ways to give your AI agent a voice with Utter:

### 1. Tell your agent to use it

Add an instruction to your agent's system prompt (or a `CLAUDE.md` / rules file) telling it to speak its replies:

> Every time you reply, run `utter me --quiet "<your reply>"` so the user hears it.

The agent will call the command as a tool on each response.

### 2. Set up a hook (automatic)

With Claude Code, you can add a hook that automatically speaks every response — no agent instructions needed. Add this to your `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Task",
        "hooks": [
          {
            "type": "command",
            "command": "utter me --quiet \"$CLAUDE_TOOL_RESULT\""
          }
        ]
      }
    ]
  }
}
```

### Tips for agent usage

- Use `--quiet` to suppress progress output and keep the agent's context clean
- Use `--json` with `utter voices` for machine-readable voice lists
- Pipe text via stdin: `echo "Hello" | utter me --quiet`
- Exit codes: `0` = success, `1` = error

## Configuration

Configuration is stored in `~/.utter/config.json`. You can also use environment variables:

| Variable | Description |
|----------|-------------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key |
| `UTTER_DEFAULT_VOICE` | Default voice ID |

## License

MIT
