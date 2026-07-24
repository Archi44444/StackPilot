# StackPilot Fixes

## Root Cause Analysis

After thorough code review, the errors are caused by:

1. **Express v5 removed `response.flushHeaders()`** — `"express": "^5.1.0"` in package.json. Express 5 removed `flushHeaders()` which is called in `chatController.js`. This breaks ALL SSE streaming (every chat response fails with `TypeError: response.flushHeaders is not a function`).

2. **Multer v2 `MulterError` class** — Multer v2 exports `MulterError` as a property, but it's a constructor check. The error handler used `error instanceof multer.MulterError` but since multer is imported via ESM from CJS, `instanceof` checks may fail. Fixed by using `error.name === 'MulterError'`.

## Steps Completed

- [x] **Fix chatController.js** - Replace `response.flushHeaders()` (removed in Express 5) with `response.writeHead(200, {...})` which works in Express 5.
- [x] **Fix errorHandler.js** - Replace `instanceof multer.MulterError` with `error.name === 'MulterError'` for cross-module compatibility.


