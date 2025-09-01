// Vitest server-side setup for pure unit tests
// This setup is for edge-runtime environment tests (Convex functions)
// No DOM dependencies or jest-dom matchers needed

import { expect } from 'vitest';

// Make expect globally available for server-side tests
globalThis.expect = expect;
