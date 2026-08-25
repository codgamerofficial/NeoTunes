# NeoTunes Extension Architecture & Safety Model

## Overview
NeoTunes provides a permissioned, failure-isolated extension architecture allowing third-party developers to register custom music providers, themes, visualizers, importers, and scrobblers.

## Extension Manifest (`NeoTunesExtensionManifest`)
```ts
interface NeoTunesExtensionManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  minNeoTunesVersion: string;
  capabilities: ExtensionCapability[];
  permissions: ExtensionPermission[];
}
```

## Failure Isolation
All extension executions route through `ExtensionRegistry.executeSafely()`. If an extension throws an exception, it is marked as `FAILED` and isolated. The global player core and main application UI continue running uninterrupted.
