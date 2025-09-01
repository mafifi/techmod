// Vitest DOM + Testing Library setup
// Import expect from vitest to make it available globally
import { expect } from 'vitest';
// Make expect globally available
globalThis.expect = expect;
// Importing this package registers jest-dom matchers with the global `expect`.
import '@testing-library/jest-dom';
