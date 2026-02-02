# Voz

A Text-to-Speech CLI using ElevenLabs, designed for humans and AI agents.

## Installation

```bash
npm install -g .
```

Or run directly:

```bash
npm install
node src/cli.mjs
```

## Setup

Get your API key from [ElevenLabs](https://elevenlabs.io/app/settings/api-keys), then:

```bash
voz init
```

Or set it via environment variable:

```bash
export ELEVENLABS_API_KEY=your_key_here
```

## Usage

### Speak text aloud

```bash
voz speak "Hello, world!"
```

### Speak from a file

```bash
voz speak --file article.txt
```

### Save to MP3

```bash
voz speak "Hello" --output hello.mp3
```

### Use a specific voice

```bash
voz speak --voice Rachel "Hello there!"
```

### Pipe text

```bash
echo "Hello from stdin" | voz speak
cat document.txt | voz speak
```

### List available voices

```bash
voz voices
```

### Set default voice

```bash
voz voices --set-default <voice-id>
```

## Options

### `voz speak`

| Option | Description |
|--------|-------------|
| `-f, --file <path>` | Read text from file |
| `-o, --output <path>` | Save audio to file instead of playing |
| `-v, --voice <voice>` | Voice ID or name |
| `-m, --model <model>` | Model ID (default: `eleven_multilingual_v2`) |
| `-s, --stream` | Stream audio chunks as they're ready |
| `-q, --quiet` | Suppress progress output |

### `voz voices`

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--set-default <id>` | Set the default voice |

## Agent Integration

Voz is designed to work seamlessly with AI agents:

- Use `--json` flag for machine-readable output
- Use `--quiet` flag to suppress progress messages
- Exit codes: `0` = success, `1` = error
- Supports stdin for piping text

Example agent usage:

```bash
# Get voices as JSON
voz voices --json

# Speak quietly (no progress output)
voz speak --quiet "Task completed successfully"

# Save audio file
voz speak --quiet --output notification.mp3 "New message received"
```

## Configuration

Configuration is stored in `~/.voz/config.json`. You can also use environment variables:

| Variable | Description |
|----------|-------------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key |
| `VOZ_DEFAULT_VOICE` | Default voice ID |

## License

MIT
