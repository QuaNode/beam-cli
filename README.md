# Beam CLI

Beam CLI is a developer tool for managing and executing distributed behaviour modules. It provides a unified command-line interface to interact with both local and remote behaviour environments.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup
 Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd beam-cli
npm install
npm run build
```

## Usage

### Running the CLI

You have several options to run the CLI locally:

**1. Using `npm start` (Builds & Runs)**
Great for testing a build locally. Note the `--` separator for arguments.
```bash
npm start -- list
npm start -- run health
```

**2. Using the built binary**
Fastest if you have already built the project (`npm run build`).
```bash
node dist/src/cli/main.js <command> [options]
```

**3. Globally linked (Recommended for usage)**
Simulates a real installation.
```bash
npm link
beam <command> [options]
```

### Commands

#### `list`
Lists all available behaviours from the backend environment.

```bash
beam list
```

#### `run <behaviour>`
Executes a specific behaviour on the backend.

**Arguments:**
- `behaviour`: The name of the behaviour to run (e.g., `health`).

**Options:**
- `--help`: Show help information.

**Example:**
```bash
# Run with JSON params
beam run health -p '{"check_db": true}'

# Run with inline arguments
beam run health check_db=true env=prod
```

#### `exec <subcommand>`
Executes complex local operations or subcommands.

**Subcommands:**
- `deploy`: Deploys a new behaviour module.

**Options:**
- `-e, --env <environment>`: Specify the target environment (e.g., `production`, `staging`).

**Example:**
```bash
beam exec deploy -e production
```

#### `help`
Displays help information for commands.

```bash
beam help
```

## Configuration

Beam CLI can be configured using environment variables. You can create a `.env` file in the root directory.

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | The port for the backend server to listen on. | `3000` |
| `BASE_URL` | The base URL for the backend API. | `http://localhost:<PORT>/api/v1` |
| `USER` | The user context for executing behaviours. | `cli_user` (or system user) |

## Development

For active development, you can run the CLI directly from the source without pre-compiling.

### Dev Shortcut

Use the `dev` script to run commands via `ts-node`:

```bash
# syntax: npm run dev -- <command> [args]

npm run dev -- list
npm run dev -- run health
npm run dev -- exec deploy -e local
```

### Architecture Overview

The project is structured as a hybrid application:
- **CLI (Frontend)**: Built with NestJS and `nest-commander` for robust command handling.
- **Backend**: A dynamic JavaScript environment that executes the actual behaviour logic.

The CLI spawns the backend process on demand if it's not already running, ensuring a seamless experience.
