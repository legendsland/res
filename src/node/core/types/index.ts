/**
 * InversifyJS Service Identifiers
 * Used to map interfaces to concrete implementations.
 */
export const TYPES = {
    // The main entry point for the CLI
    CommandExecutor: Symbol.for('CommandExecutor'),

    // All CLI commands are bound to this multi-injection symbol
    Command: Symbol.for('Command'),

    // Infrastructure / Services
    Database: Symbol.for('Database'),
    Logger: Symbol.for('Logger'),
    FileSystem: Symbol.for('FileSystem'),

    // Configuration
    AppConfig: Symbol.for('AppConfig'),
};
