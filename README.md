# Utter

A Text-to-Speech CLI using ElevenLabs, designed for humans and AI agents.

## Installation

```bash
npm install -g .
```

Or run directly:

```bash
npm install
npm run build
node dist/cli.js
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

## Agent Integration

Utter is designed to work seamlessly with AI agents:

- Use `--json` flag for machine-readable output
- Use `--quiet` flag to suppress progress messages
- Exit codes: `0` = success, `1` = error
- Supports stdin for piping text

Example agent usage:

```bash
# Get voices as JSON
utter voices --json

# Speak quietly (no progress output)
utter me --quiet "Task completed successfully"

# Save audio file
utter to notification.mp3 --quiet "New message received"
```

## Configuration

Configuration is stored in `~/.utter/config.json`. You can also use environment variables:

| Variable | Description |
|----------|-------------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key |
| `UTTER_DEFAULT_VOICE` | Default voice ID |

## License

MIT
