# VBWD View Component

Shared Vue 3 component library and TypeScript SDK for VBWD user and admin applications.

## Features

- 🔌 **Plugin System**: Extensible architecture for features
- 🌐 **API Client**: Type-safe HTTP client with interceptors
- 🔐 **Authentication**: JWT-based auth with token management
- 📡 **Event Bus**: Decoupled communication between plugins
- ✅ **Validation**: Zod-based schema validation
- 🎨 **UI Components**: Shared Vue 3 components
- 🪝 **Composables**: Reusable Vue composition functions
- 🔒 **Access Control**: Permission and role-based access

## Installation

```bash
npm install @vbwd/view-component
```

## Usage

```typescript
import { version, name } from '@vbwd/view-component';

console.log(`${name} v${version}`);
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Project Structure

```
src/
├── plugins/          # Plugin system (registry, SDK)
├── cli/              # CLI Plugin Manager
├── api/              # API client
├── auth/             # Authentication
├── events/           # Event bus
├── validation/       # Validation
├── components/       # UI components
├── composables/      # Composables
├── access-control/   # Access control
├── stores/           # Pinia stores
├── guards/           # Route guards
├── types/            # TypeScript types
└── utils/            # Utilities

tests/
├── unit/             # Unit tests
├── integration/      # Integration tests
└── fixtures/         # Test fixtures
```

## CLI Plugin Manager

The core library includes a CLI tool for managing plugins in applications that extend view-core.

### Commands

```bash
# In admin or user app directory
npm run plugin list           # List all plugins with status
npm run plugin install <name> # Install a plugin
npm run plugin uninstall <name>  # Remove a plugin
npm run plugin activate <name>   # Enable a plugin
npm run plugin deactivate <name> # Disable a plugin
npm run plugin help           # Show help
npm run plugin version        # Show version
```

### Integration

To use the CLI in your application:

1. Create `bin/plugin-manager.ts`:

```typescript
#!/usr/bin/env npx tsx
import { PluginManagerCLI } from '../../core/src/cli/PluginManagerCLI';
import { PluginRegistry } from '../../core/src/plugins/PluginRegistry';

const registry = new PluginRegistry();
const cli = new PluginManagerCLI(registry, {
  pluginsDir: './src/plugins',
  configFile: './plugins.json'
});

cli.run(process.argv.slice(2))
  .catch((error: Error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
```

2. Add npm script to `package.json`:

```json
{
  "scripts": {
    "plugin": "npx tsx bin/plugin-manager.ts"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

3. Create `plugins.json`:

```json
{
  "plugins": {}
}
```

### Plugin Configuration Schema

```json
{
  "plugins": {
    "plugin-name": {
      "enabled": true,
      "version": "1.0.0",
      "installedAt": "2026-01-05T10:30:00.000Z",
      "source": "local"
    }
  }
}
```

## Testing Strategy

- **Unit Tests**: Test individual classes and functions
- **Integration Tests**: Test module interactions
- **Component Tests**: Test Vue components
- **Coverage Target**: ≥ 95%

## Sprint Status

- [x] Sprint 0: Foundation (Setup, TypeScript, Vitest)
- [ ] Sprint 1: Plugin System
- [ ] Sprint 2: API Client
- [ ] Sprint 3: Authentication
- [ ] Sprint 4: Event Bus & Validation
- [ ] Sprint 5: UI Components
- [ ] Sprint 6: Composables
- [ ] Sprint 7: Access Control
- [ ] Sprint 8: Integration & Documentation

## License

CC0-1.0 Universal (Public Domain)
