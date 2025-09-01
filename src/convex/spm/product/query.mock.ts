import { vi } from 'vitest';

// Mock for UI tests - simpler than complex vi.mock setup
export const mockProductQueries = {
	getAll: vi.fn(),
	getByCategory: vi.fn(),
	getInPriceRange: vi.fn(),
	search: vi.fn()
};

// Reset function for beforeEach hooks
export const resetProductQueryMocks = () => {
	Object.values(mockProductQueries).forEach((mock) => mock.mockReset());
};
