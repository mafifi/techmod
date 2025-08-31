import { vi, type MockedFunction } from 'vitest';
import type { MutationCtx, QueryCtx, ActionCtx } from '../_generated/server';

/**
 * Mock utilities for Convex function testing
 * Provides mockable context objects for unit testing Convex functions
 */

export type MockQueryCtx = {
	db: MockDatabase;
	auth: MockAuth;
};

export type MockMutationCtx = MockQueryCtx & {
	scheduler: MockScheduler;
};

export type MockActionCtx = {
	auth: MockAuth;
	scheduler: MockScheduler;
	runQuery: MockedFunction<any>;
	runMutation: MockedFunction<any>;
};

export type MockDatabase = {
	query: MockedFunction<any>;
	get: MockedFunction<any>;
	insert: MockedFunction<any>;
	patch: MockedFunction<any>;
	replace: MockedFunction<any>;
	delete: MockedFunction<any>;
};

export type MockAuth = {
	getUserIdentity: MockedFunction<any>;
	getUserId: MockedFunction<any>;
};

export type MockScheduler = {
	runAfter: MockedFunction<any>;
	runAt: MockedFunction<any>;
	cancel: MockedFunction<any>;
};

/**
 * Mock query builder for database operations
 */
export class MockQueryBuilder {
	private mockData: any[] = [];

	constructor(data: any[] = []) {
		this.mockData = data;
	}

	collect = vi.fn().mockResolvedValue(this.mockData);
	first = vi.fn().mockResolvedValue(this.mockData[0] || null);
	unique = vi.fn().mockResolvedValue(this.mockData[0] || null);
	filter = vi.fn().mockReturnThis();
	order = vi.fn().mockReturnThis();
	withIndex = vi.fn().mockReturnThis();
	paginate = vi.fn().mockResolvedValue({
		page: this.mockData,
		continueCursor: null,
		isDone: true
	});

	// Chain methods return this for fluent API
	take = vi.fn().mockReturnThis();
	skip = vi.fn().mockReturnThis();
}

/**
 * ConvexMock factory for creating mock contexts
 */
export class ConvexMock {
	/**
	 * Create mock database with optional pre-seeded data
	 */
	static createMockDatabase(tableData: Record<string, any[]> = {}): MockDatabase {
		return {
			query: vi.fn().mockImplementation((tableName: string) => {
				const data = tableData[tableName] || [];
				return new MockQueryBuilder(data);
			}),
			get: vi.fn().mockResolvedValue(null),
			insert: vi.fn().mockResolvedValue('mock_id_123'),
			patch: vi.fn().mockResolvedValue(undefined),
			replace: vi.fn().mockResolvedValue(undefined),
			delete: vi.fn().mockResolvedValue(undefined)
		};
	}

	/**
	 * Create mock auth with optional user
	 */
	static createMockAuth(mockUser: any = null): MockAuth {
		return {
			getUserIdentity: vi.fn().mockResolvedValue(mockUser),
			getUserId: vi.fn().mockResolvedValue(mockUser?.userId || null)
		};
	}

	/**
	 * Create mock scheduler
	 */
	static createMockScheduler(): MockScheduler {
		return {
			runAfter: vi.fn().mockResolvedValue('mock_job_id'),
			runAt: vi.fn().mockResolvedValue('mock_job_id'),
			cancel: vi.fn().mockResolvedValue(undefined)
		};
	}

	/**
	 * Create mock query context
	 */
	static createMockQueryCtx(options: {
		tableData?: Record<string, any[]>;
		user?: any;
	} = {}): MockQueryCtx {
		return {
			db: this.createMockDatabase(options.tableData),
			auth: this.createMockAuth(options.user)
		};
	}

	/**
	 * Create mock mutation context
	 */
	static createMockMutationCtx(options: {
		tableData?: Record<string, any[]>;
		user?: any;
	} = {}): MockMutationCtx {
		return {
			db: this.createMockDatabase(options.tableData),
			auth: this.createMockAuth(options.user),
			scheduler: this.createMockScheduler()
		};
	}

	/**
	 * Create mock action context
	 */
	static createMockActionCtx(options: {
		user?: any;
	} = {}): MockActionCtx {
		return {
			auth: this.createMockAuth(options.user),
			scheduler: this.createMockScheduler(),
			runQuery: vi.fn().mockResolvedValue({}),
			runMutation: vi.fn().mockResolvedValue('mock_result')
		};
	}

	/**
	 * Helper to create mock ID
	 */
	static createMockId(prefix: string = 'mock'): string {
		return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Reset all mocks - useful in beforeEach
	 */
	static resetAllMocks(): void {
		vi.clearAllMocks();
	}
}