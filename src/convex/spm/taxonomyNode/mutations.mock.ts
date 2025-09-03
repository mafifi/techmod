import { vi } from 'vitest';
import { TaxonomyNodeDTOMock } from '../../../lib/modules/spm/domain/TaxonomyNodeDTOMock';

/**
 * Mock implementations for taxonomy node mutations
 * Used for testing without actual Convex backend calls
 */

// Mock mutation implementations
export const mockTaxonomyNodeMutations = {
	create: vi.fn(),
	update: vi.fn(),
	deleteNode: vi.fn(),
	deactivate: vi.fn(),
	reactivate: vi.fn(),
	moveNode: vi.fn(),
	updateStrategy: vi.fn(),
	bulkUpdate: vi.fn(),
	restoreFromHistory: vi.fn()
};

/**
 * Reset all mutation mocks to their initial state
 */
export function resetTaxonomyNodeMutationMocks(): void {
	Object.values(mockTaxonomyNodeMutations).forEach(mock => {
		mock.mockClear();
	});

	// Set default successful return values
	mockTaxonomyNodeMutations.create.mockResolvedValue('new_taxonomy_node_id');
	mockTaxonomyNodeMutations.update.mockResolvedValue(true);
	mockTaxonomyNodeMutations.deleteNode.mockResolvedValue(true);
	mockTaxonomyNodeMutations.deactivate.mockResolvedValue(true);
	mockTaxonomyNodeMutations.reactivate.mockResolvedValue(true);
	mockTaxonomyNodeMutations.moveNode.mockResolvedValue(true);
	mockTaxonomyNodeMutations.updateStrategy.mockResolvedValue(true);
	mockTaxonomyNodeMutations.bulkUpdate.mockResolvedValue({ updated: 3, failed: 0 });
	mockTaxonomyNodeMutations.restoreFromHistory.mockResolvedValue(true);
}

/**
 * Set specific mock behaviors for testing scenarios
 */
export const mockTaxonomyNodeMutationScenarios = {
	/**
	 * Simulate successful operations
	 */
	allSuccessful: () => {
		resetTaxonomyNodeMutationMocks();
	},

	/**
	 * Simulate all operations failing
	 */
	allFailed: (errorMessage: string = 'Mutation failed') => {
		const error = new Error(errorMessage);
		Object.values(mockTaxonomyNodeMutations).forEach(mock => {
			mock.mockRejectedValue(error);
		});
	},

	/**
	 * Simulate create operation failing due to validation
	 */
	createValidationFailed: () => {
		const validationError = new Error('Validation failed: Name is required');
		validationError.name = 'ValidationError';
		mockTaxonomyNodeMutations.create.mockRejectedValue(validationError);
	},

	/**
	 * Simulate create operation failing due to duplicate name
	 */
	createDuplicateNameFailed: () => {
		const duplicateError = new Error('A node with this name already exists');
		duplicateError.name = 'ConflictError';
		mockTaxonomyNodeMutations.create.mockRejectedValue(duplicateError);
	},

	/**
	 * Simulate create operation failing due to invalid parent
	 */
	createInvalidParentFailed: () => {
		const parentError = new Error('Invalid parent selection for this node type');
		parentError.name = 'ValidationError';
		mockTaxonomyNodeMutations.create.mockRejectedValue(parentError);
	},

	/**
	 * Simulate successful create with specific ID
	 */
	createSuccessful: (nodeId: string = 'new_taxonomy_node_id') => {
		mockTaxonomyNodeMutations.create.mockResolvedValue(nodeId);
	},

	/**
	 * Simulate update operation failing due to not found
	 */
	updateNotFound: () => {
		const notFoundError = new Error('Taxonomy node not found');
		notFoundError.name = 'NotFoundError';
		mockTaxonomyNodeMutations.update.mockRejectedValue(notFoundError);
	},

	/**
	 * Simulate update operation with optimistic concurrency conflict
	 */
	updateConcurrencyConflict: () => {
		const conflictError = new Error('Node was modified by another user');
		conflictError.name = 'ConcurrencyError';
		mockTaxonomyNodeMutations.update.mockRejectedValue(conflictError);
	},

	/**
	 * Simulate delete operation failing due to children existing
	 */
	deleteHasChildren: () => {
		const childrenError = new Error('Cannot delete node with children. Use force delete or deactivate instead.');
		childrenError.name = 'ValidationError';
		mockTaxonomyNodeMutations.deleteNode.mockRejectedValue(childrenError);
	},

	/**
	 * Simulate delete operation failing due to being referenced
	 */
	deleteHasReferences: () => {
		const referencesError = new Error('Cannot delete node: it is referenced by products');
		referencesError.name = 'ValidationError';
		mockTaxonomyNodeMutations.deleteNode.mockRejectedValue(referencesError);
	},

	/**
	 * Simulate successful force delete
	 */
	forceDeleteSuccessful: () => {
		mockTaxonomyNodeMutations.deleteNode.mockImplementation((args: any) => {
			if (args.forceDelete) {
				return Promise.resolve(true);
			} else {
				return Promise.reject(new Error('Cannot delete node with children'));
			}
		});
	},

	/**
	 * Simulate move operation failing due to circular reference
	 */
	moveCircularReference: () => {
		const circularError = new Error('Cannot move node: would create circular reference');
		circularError.name = 'ValidationError';
		mockTaxonomyNodeMutations.moveNode.mockRejectedValue(circularError);
	},

	/**
	 * Simulate move operation failing due to invalid target
	 */
	moveInvalidTarget: () => {
		const targetError = new Error('Invalid target parent for this node type');
		targetError.name = 'ValidationError';
		mockTaxonomyNodeMutations.moveNode.mockRejectedValue(targetError);
	},

	/**
	 * Simulate deactivate operation with cascade
	 */
	deactivateWithCascade: () => {
		mockTaxonomyNodeMutations.deactivate.mockImplementation((args: any) => {
			return Promise.resolve({
				success: true,
				deactivatedCount: args.cascadeToChildren ? 5 : 1,
				message: args.cascadeToChildren 
					? 'Node and 4 children deactivated' 
					: 'Node deactivated'
			});
		});
	},

	/**
	 * Simulate reactivate operation failing due to inactive parent
	 */
	reactivateInactiveParent: () => {
		const parentError = new Error('Cannot reactivate node: parent is inactive');
		parentError.name = 'ValidationError';
		mockTaxonomyNodeMutations.reactivate.mockRejectedValue(parentError);
	},

	/**
	 * Simulate partial bulk update
	 */
	bulkUpdatePartialFailure: () => {
		mockTaxonomyNodeMutations.bulkUpdate.mockResolvedValue({
			updated: 2,
			failed: 1,
			errors: ['Node not found: invalid_id']
		});
	},

	/**
	 * Simulate network timeout
	 */
	networkTimeout: () => {
		const timeoutError = new Error('Request timeout');
		timeoutError.name = 'TimeoutError';
		Object.values(mockTaxonomyNodeMutations).forEach(mock => {
			mock.mockRejectedValue(timeoutError);
		});
	},

	/**
	 * Simulate permission denied
	 */
	permissionDenied: () => {
		const permissionError = new Error('Insufficient permissions');
		permissionError.name = 'PermissionError';
		Object.values(mockTaxonomyNodeMutations).forEach(mock => {
			mock.mockRejectedValue(permissionError);
		});
	},

	/**
	 * Simulate database connection error
	 */
	databaseConnectionError: () => {
		const dbError = new Error('Database connection failed');
		dbError.name = 'DatabaseError';
		Object.values(mockTaxonomyNodeMutations).forEach(mock => {
			mock.mockRejectedValue(dbError);
		});
	},

	/**
	 * Mock specific mutation call patterns
	 */
	trackMutationCalls: () => {
		// Reset to track calls
		resetTaxonomyNodeMutationMocks();
		
		return {
			getCreateCalls: () => mockTaxonomyNodeMutations.create.mock.calls,
			getUpdateCalls: () => mockTaxonomyNodeMutations.update.mock.calls,
			getDeleteCalls: () => mockTaxonomyNodeMutations.deleteNode.mock.calls,
			getMoveCalls: () => mockTaxonomyNodeMutations.moveNode.mock.calls,
			getDeactivateCalls: () => mockTaxonomyNodeMutations.deactivate.mock.calls,
			getReactivateCalls: () => mockTaxonomyNodeMutations.reactivate.mock.calls,
			
			// Call inspection helpers (use these instead of expect in tests)
			getLastCreateCall: () => {
				const calls = mockTaxonomyNodeMutations.create.mock.calls;
				return calls[calls.length - 1];
			},
			getLastUpdateCall: () => {
				const calls = mockTaxonomyNodeMutations.update.mock.calls;
				return calls[calls.length - 1];
			},
			getLastDeleteCall: () => {
				const calls = mockTaxonomyNodeMutations.deleteNode.mock.calls;
				return calls[calls.length - 1];
			}
		};
	}
};

// Initialize with default values
resetTaxonomyNodeMutationMocks();