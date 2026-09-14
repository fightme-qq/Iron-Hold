# Debug Loop

Build errors:

1. Run `npm run build`.
2. Read the first TypeScript or Vite error.
3. Open the referenced file.
4. Fix the root cause.
5. Rerun `npm run build`.

Runtime errors:

1. Start dev server.
2. Inspect browser console.
3. Check scene keys and scene order.
4. Check preload keys and asset URLs.
5. Check missing DOM container or Phaser config.
6. Check input listeners and scene restart cleanup.

Blank canvas checklist:

- Phaser game created.
- Canvas exists and has nonzero size.
- Scene is registered and started.
- Preload completed or failed visibly.
- Asset paths use Vite public paths correctly.
- No exception occurred during `create()`.
