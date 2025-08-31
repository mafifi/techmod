import { vi } from 'vitest';

/**
 * Reusable testing utilities for SPM architecture
 * Common patterns and helpers for all test types
 */

/**
 * Common test data generators
 */
export class TestDataGenerator {
	private static counter = 1;

	/**
	 * Generate unique test IDs
	 */
	static generateId(prefix: string = 'test'): string {
		return `${prefix}_${Date.now()}_${this.counter++}`;
	}

	/**
	 * Generate timestamp for test data
	 */
	static generateTimestamp(): number {
		return Date.now() - (this.counter * 1000); // Slightly different timestamps
	}

	/**
	 * Reset counter for predictable test data
	 */
	static resetCounter(): void {
		this.counter = 1;
	}
}

/**
 * Async testing utilities
 */
export class AsyncTestUtils {
	/**
	 * Wait for a specific amount of time
	 */
	static async wait(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Wait for a condition to be true
	 */
	static async waitFor(
		condition: () => boolean | Promise<boolean>,
		options: { timeout?: number; interval?: number } = {}
	): Promise<void> {
		const { timeout = 5000, interval = 100 } = options;
		const start = Date.now();

		while (Date.now() - start < timeout) {
			if (await condition()) {
				return;
			}
			await this.wait(interval);
		}

		throw new Error(`Condition not met within ${timeout}ms`);
	}

	/**
	 * Test that a function throws an error with specific message
	 */
	static async expectToThrowAsync(
		fn: () => Promise<any>,
		expectedMessage?: string
	): Promise<Error> {
		try {
			await fn();
			throw new Error('Expected function to throw, but it did not');
		} catch (error) {
			if (expectedMessage && !error.message.includes(expectedMessage)) {
				throw new Error(`Expected error message to contain "${expectedMessage}", but got "${error.message}"`);
			}
			return error;
		}
	}
}

/**
 * Mock setup utilities
 */
export class MockSetupUtils {
	/**
	 * Create a comprehensive mock function with common patterns
	 */
	static createMockFunction<T extends (...args: any[]) => any>(
		defaultReturnValue?: ReturnType<T>
	) {
		const mockFn = vi.fn();
		
		if (defaultReturnValue !== undefined) {
			if (defaultReturnValue instanceof Promise) {
				mockFn.mockResolvedValue(await defaultReturnValue);
			} else {
				mockFn.mockReturnValue(defaultReturnValue);
			}
		}

		return Object.assign(mockFn, {
			// Helper methods for common test scenarios
			mockSuccess: (value: ReturnType<T>) => {
				if (value instanceof Promise) {
					return mockFn.mockResolvedValue(value);
				}
				return mockFn.mockReturnValue(value);
			},
			mockError: (error: Error) => mockFn.mockRejectedValue(error),
			mockOnce: (value: ReturnType<T>) => {
				if (value instanceof Promise) {
					return mockFn.mockResolvedValueOnce(value);
				}
				return mockFn.mockReturnValueOnce(value);
			},
			mockImplementationOnce: (impl: T) => mockFn.mockImplementationOnce(impl)
		});
	}

	/**
	 * Create a mock object with all methods as mock functions
	 */
	static createMockObject<T extends Record<string, any>>(
		shape: T,
		defaultImplementations?: Partial<T>
	): T & Record<keyof T, ReturnType<typeof vi.fn>> {
		const mock = {} as any;

		for (const key in shape) {
			if (typeof shape[key] === 'function') {
				mock[key] = vi.fn();
				if (defaultImplementations?.[key]) {
					mock[key].mockImplementation(defaultImplementations[key]);
				}
			} else {
				mock[key] = shape[key];
			}
		}

		return mock;
	}

	/**
	 * Setup common beforeEach patterns for tests
	 */
	static setupCommonMocks() {
		// Clear all mocks before each test
		vi.clearAllMocks();
		
		// Reset test data generators
		TestDataGenerator.resetCounter();

		// Mock common global functions if needed
		const mockConsole = {
			log: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			info: vi.fn()
		};

		// Return cleanup function
		return {
			mockConsole,
			cleanup: () => {
				vi.restoreAllMocks();
			}
		};
	}
}

/**
 * Assertion utilities for complex objects
 */
export class AssertionUtils {
	/**
	 * Check if object matches expected shape (useful for API responses)
	 */
	static expectObjectToHaveShape<T>(
		actual: unknown,
		expectedShape: Partial<T>,
		options: { strict?: boolean } = {}
	): asserts actual is T {
		const { strict = false } = options;

		if (typeof actual !== 'object' || actual === null) {
			throw new Error(`Expected object, got ${typeof actual}`);
		}

		const actualObj = actual as Record<string, any>;

		for (const key in expectedShape) {
			if (!(key in actualObj)) {
				throw new Error(`Expected property "${key}" to exist`);
			}

			const expectedType = typeof expectedShape[key];
			const actualType = typeof actualObj[key];

			if (expectedType !== actualType) {
				throw new Error(`Expected property "${key}" to be ${expectedType}, got ${actualType}`);
			}
		}

		if (strict) {
			for (const key in actualObj) {
				if (!(key in expectedShape)) {
					throw new Error(`Unexpected property "${key}" found`);
				}
			}
		}
	}

	/**
	 * Check if array contains objects with expected properties
	 */
	static expectArrayToContainObjectsWithShape<T>(
		actual: unknown[],
		expectedShape: Partial<T>
	): void {
		if (!Array.isArray(actual)) {
			throw new Error('Expected an array');
		}

		if (actual.length === 0) {
			throw new Error('Expected non-empty array');
		}

		actual.forEach((item, index) => {
			try {
				this.expectObjectToHaveShape(item, expectedShape);
			} catch (error) {
				throw new Error(`Item at index ${index}: ${error.message}`);
			}
		});
	}

	/**
	 * Verify that all mock functions have been called as expected
	 */
	static verifyMockCallExpectations(
		mocks: Record<string, ReturnType<typeof vi.fn>>,
		expectations: Record<string, { called?: boolean; calledWith?: any[]; calledTimes?: number }>
	): void {
		for (const [mockName, expectation] of Object.entries(expectations)) {
			const mock = mocks[mockName];
			if (!mock) {
				throw new Error(`Mock "${mockName}" not found`);
			}

			if (expectation.called !== undefined) {
				if (expectation.called && !mock.mock.calls.length) {
					throw new Error(`Expected mock "${mockName}" to be called, but it was not`);
				}
				if (!expectation.called && mock.mock.calls.length) {
					throw new Error(`Expected mock "${mockName}" not to be called, but it was called ${mock.mock.calls.length} times`);
				}
			}

			if (expectation.calledTimes !== undefined) {
				if (mock.mock.calls.length !== expectation.calledTimes) {
					throw new Error(`Expected mock "${mockName}" to be called ${expectation.calledTimes} times, but it was called ${mock.mock.calls.length} times`);
				}
			}

			if (expectation.calledWith !== undefined) {
				const wasCalledWithExpected = mock.mock.calls.some(call => 
					JSON.stringify(call) === JSON.stringify(expectation.calledWith)
				);
				if (!wasCalledWithExpected) {
					throw new Error(`Expected mock "${mockName}" to be called with ${JSON.stringify(expectation.calledWith)}, but it was not`);
				}
			}
		}
	}
}

/**
 * Integration test utilities
 */
export class IntegrationTestUtils {
	/**
	 * Setup test database state (for integration tests)
	 */
	static async setupTestData<T>(
		insertFn: (data: T) => Promise<string>,
		testData: T[]
	): Promise<string[]> {
		const ids: string[] = [];
		for (const data of testData) {
			const id = await insertFn(data);
			ids.push(id);
		}
		return ids;
	}

	/**
	 * Cleanup test data after integration tests
	 */
	static async cleanupTestData(
		deleteFn: (id: string) => Promise<void>,
		ids: string[]
	): Promise<void> {
		await Promise.all(ids.map(id => deleteFn(id)));
	}

	/**
	 * Verify database state matches expected
	 */
	static async verifyDatabaseState<T>(
		getFn: () => Promise<T[]>,
		expectedCount: number,
		validator?: (items: T[]) => boolean
	): Promise<void> {
		const items = await getFn();
		
		if (items.length !== expectedCount) {
			throw new Error(`Expected ${expectedCount} items, got ${items.length}`);
		}

		if (validator && !validator(items)) {
			throw new Error('Database state validation failed');
		}
	}
}