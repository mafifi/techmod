import { vi } from 'vitest';

// Mock for UI tests - simpler than complex vi.mock setup
export const mockProductMutations = {
	create: vi.fn(),
	updateById: vi.fn(),
	deleteById: vi.fn()
};

// Reset function for beforeEach hooks
export const resetProductMutationMocks = () => {
	Object.values(mockProductMutations).forEach((mock) => mock.mockReset());
};
