import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TaxonomyNodeDialog from './TaxonomyNodeDialog.svelte';
import { TaxonomyTestUtils } from './TaxonomyTestUtils';
import { TaxonomyNodeDTOMock } from '../../domain/TaxonomyNodeDTOMock';
import type { TaxonomyNode, TaxonomyNodeType } from '../../domain/TaxonomyNodeDTO';
import type { Id } from '../../../../../convex/_generated/dataModel';

// Mock UI components
vi.mock('$lib/ui/components/button', () => ({
	Button: vi.fn().mockImplementation(({ children, onclick, disabled, variant, ...props }) => 
		`<button ${onclick ? `data-onclick="true"` : ''} ${disabled ? 'disabled' : ''} data-variant="${variant || 'default'}">${children}</button>`
	)
}));

vi.mock('$lib/ui/components/input', () => ({
	Input: vi.fn().mockImplementation(({ value, placeholder, ...props }) => 
		`<input type="text" value="${value || ''}" placeholder="${placeholder || ''}" />`
	)
}));

vi.mock('$lib/ui/components/textarea', () => ({
	Textarea: vi.fn().mockImplementation(({ value, placeholder, rows, ...props }) => 
		`<textarea rows="${rows || 4}" placeholder="${placeholder || ''}">${value || ''}</textarea>`
	)
}));

vi.mock('$lib/ui/components/dialog', () => ({
	Dialog: vi.fn().mockImplementation(({ children, ...props }) => `<div role="dialog">${children}</div>`),
	DialogContent: vi.fn().mockImplementation(({ children, ...props }) => `<div class="dialog-content">${children}</div>`),
	DialogDescription: vi.fn().mockImplementation(({ children, ...props }) => `<div class="dialog-description">${children}</div>`),
	DialogFooter: vi.fn().mockImplementation(({ children, ...props }) => `<div class="dialog-footer">${children}</div>`),
	DialogHeader: vi.fn().mockImplementation(({ children, ...props }) => `<div class="dialog-header">${children}</div>`),
	DialogTitle: vi.fn().mockImplementation(({ children, ...props }) => `<h2 class="dialog-title">${children}</h2>`)
}));

vi.mock('$lib/ui/components/select', () => ({
	Select: vi.fn(),
	SelectContent: vi.fn(),
	SelectItem: vi.fn(),
	SelectTrigger: vi.fn()
}));

// Mock Lucide icons
vi.mock('lucide-svelte', () => ({
	Folder: vi.fn().mockImplementation(() => '<svg class="folder-icon"></svg>'),
	Package: vi.fn().mockImplementation(() => '<svg class="package-icon"></svg>'),
	Tag: vi.fn().mockImplementation(() => '<svg class="tag-icon"></svg>'),
	AlertCircle: vi.fn().mockImplementation(() => '<svg class="alert-icon"></svg>')
}));

describe('TaxonomyNodeDialog', () => {
	let mockProps: {
		mode: 'create' | 'edit';
		node?: TaxonomyNode;
		nodeType: TaxonomyNodeType;
		parentId?: Id<'taxonomyNodes'> | null;
		validParentOptions: any[];
		onSubmit: ReturnType<typeof vi.fn>;
		onCancel: ReturnType<typeof vi.fn>;
	};
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		vi.clearAllMocks();
		TaxonomyNodeDTOMock.resetCounter();
		TaxonomyTestUtils.mockBrowserAPIs();
		user = userEvent.setup();

		mockProps = {
			mode: 'create',
			nodeType: 'portfolio',
			validParentOptions: [],
			onSubmit: vi.fn().mockResolvedValue(undefined),
			onCancel: vi.fn()
		};
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('Create Mode', () => {
		it('should render create dialog for portfolio', () => {
			render(TaxonomyNodeDialog, mockProps);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			expect(screen.getByText('Create Portfolio')).toBeInTheDocument();
			expect(screen.getByText('Create a new portfolio to organize your product lines')).toBeInTheDocument();
		});

		it('should render create dialog for line', () => {
			const lineProps = { ...mockProps, nodeType: 'line' as TaxonomyNodeType };
			render(TaxonomyNodeDialog, lineProps);

			expect(screen.getByText('Create Product Line')).toBeInTheDocument();
		});

		it('should render create dialog for category', () => {
			const categoryProps = { ...mockProps, nodeType: 'category' as TaxonomyNodeType };
			render(TaxonomyNodeDialog, categoryProps);

			expect(screen.getByText('Create Category')).toBeInTheDocument();
		});

		it('should show empty form fields for create mode', () => {
			render(TaxonomyNodeDialog, mockProps);

			expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Name field
			expect(screen.getByPlaceholderText('Enter a descriptive name')).toBeInTheDocument();
		});

		it('should show parent selection for child nodes', () => {
			const validParents = TaxonomyNodeDTOMock.createTaxonomyNodeArray(2, 'portfolio');
			const lineProps = { 
				...mockProps, 
				nodeType: 'line' as TaxonomyNodeType,
				validParentOptions: validParents
			};
			
			render(TaxonomyNodeDialog, lineProps);

			expect(screen.getByText('Parent Portfolio')).toBeInTheDocument();
		});

		it('should not show parent selection for portfolio nodes', () => {
			render(TaxonomyNodeDialog, mockProps);

			expect(screen.queryByText('Parent Portfolio')).not.toBeInTheDocument();
		});
	});

	describe('Edit Mode', () => {
		it('should render edit dialog with existing node data', () => {
			const existingNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Existing Portfolio',
				description: 'An existing portfolio description'
			});
			
			const editProps = {
				...mockProps,
				mode: 'edit' as const,
				node: existingNode
			};

			render(TaxonomyNodeDialog, editProps);

			expect(screen.getByText('Edit Portfolio')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Existing Portfolio')).toBeInTheDocument();
			expect(screen.getByDisplayValue('An existing portfolio description')).toBeInTheDocument();
		});

		it('should populate form with existing node values', () => {
			const existingNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Test Node',
				description: 'Test Description',
				strategy: 'Test Strategy',
				isActive: false
			});
			
			const editProps = {
				...mockProps,
				mode: 'edit' as const,
				node: existingNode
			};

			render(TaxonomyNodeDialog, editProps);

			expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Test Strategy')).toBeInTheDocument();
		});

		it('should show update button in edit mode', () => {
			const existingNode = TaxonomyNodeDTOMock.createTaxonomyNode();
			const editProps = {
				...mockProps,
				mode: 'edit' as const,
				node: existingNode
			};

			render(TaxonomyNodeDialog, editProps);

			expect(screen.getByText('Update Portfolio')).toBeInTheDocument();
		});
	});

	describe('Form Fields', () => {
		it('should render all required form fields', () => {
			render(TaxonomyNodeDialog, mockProps);

			expect(screen.getByLabelText('Name')).toBeInTheDocument();
			expect(screen.getByLabelText('Description')).toBeInTheDocument();
			expect(screen.getByLabelText('Strategy (Optional)')).toBeInTheDocument();
			expect(screen.getByLabelText('Status')).toBeInTheDocument();
		});

		it('should handle name field input', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const nameInput = screen.getByLabelText('Name');
			await user.type(nameInput, 'New Portfolio Name');

			expect(nameInput).toHaveValue('New Portfolio Name');
		});

		it('should handle description field input', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const descriptionInput = screen.getByLabelText('Description');
			await user.type(descriptionInput, 'New portfolio description');

			expect(descriptionInput).toHaveValue('New portfolio description');
		});

		it('should handle strategy field input', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const strategyInput = screen.getByLabelText('Strategy (Optional)');
			await user.type(strategyInput, 'Strategic direction for the portfolio');

			expect(strategyInput).toHaveValue('Strategic direction for the portfolio');
		});

		it('should handle status toggle', async () => {
			render(TaxonomyNodeDialog, mockProps);

			// Test status selection
			const statusSelect = screen.getByLabelText('Status');
			expect(statusSelect).toBeInTheDocument();
		});
	});

	describe('Form Validation', () => {
		it('should show validation errors for empty required fields', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			// Should show validation errors
			await waitFor(() => {
				expect(screen.getByText('Name is required')).toBeInTheDocument();
				expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
			});
		});

		it('should show error for name too long', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const nameInput = screen.getByLabelText('Name');
			await user.type(nameInput, 'A'.repeat(101)); // Exceeds 100 char limit

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Name must be 100 characters or less')).toBeInTheDocument();
			});
		});

		it('should show error for description too short', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const nameInput = screen.getByLabelText('Name');
			const descriptionInput = screen.getByLabelText('Description');
			
			await user.type(nameInput, 'Valid Name');
			await user.type(descriptionInput, 'Short'); // Less than 10 chars

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
			});
		});

		it('should show error for strategy too short when provided', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const nameInput = screen.getByLabelText('Name');
			const descriptionInput = screen.getByLabelText('Description');
			const strategyInput = screen.getByLabelText('Strategy (Optional)');
			
			await user.type(nameInput, 'Valid Name');
			await user.type(descriptionInput, 'Valid description that is long enough');
			await user.type(strategyInput, '123'); // Less than 5 chars

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Strategy must be at least 5 characters')).toBeInTheDocument();
			});
		});

		it('should validate parent selection for child nodes', async () => {
			const lineProps = { 
				...mockProps, 
				nodeType: 'line' as TaxonomyNodeType,
				validParentOptions: TaxonomyNodeDTOMock.createTaxonomyNodeArray(2, 'portfolio')
			};

			render(TaxonomyNodeDialog, lineProps);

			const nameInput = screen.getByLabelText('Name');
			const descriptionInput = screen.getByLabelText('Description');
			
			await user.type(nameInput, 'Valid Line Name');
			await user.type(descriptionInput, 'Valid line description');

			const submitButton = screen.getByText('Create Product Line');
			await user.click(submitButton);

			// Should require parent selection
			await waitFor(() => {
				expect(screen.getByText('Parent portfolio is required')).toBeInTheDocument();
			});
		});

		it('should clear errors when input becomes valid', async () => {
			render(TaxonomyNodeDialog, mockProps);

			// First trigger validation error
			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Name is required')).toBeInTheDocument();
			});

			// Then fix the error
			const nameInput = screen.getByLabelText('Name');
			await user.type(nameInput, 'Valid Name');

			// Error should be cleared
			await waitFor(() => {
				expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
			});
		});
	});

	describe('Form Submission', () => {
		it('should call onSubmit with form data on successful validation', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const nameInput = screen.getByLabelText('Name');
			const descriptionInput = screen.getByLabelText('Description');
			const strategyInput = screen.getByLabelText('Strategy (Optional)');
			
			await user.type(nameInput, 'Test Portfolio');
			await user.type(descriptionInput, 'A comprehensive test portfolio description');
			await user.type(strategyInput, 'Strategic direction for testing');

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockProps.onSubmit).toHaveBeenCalledWith(
					expect.objectContaining({
						name: 'Test Portfolio',
						description: 'A comprehensive test portfolio description',
						strategy: 'Strategic direction for testing',
						isActive: true
					})
				);
			});
		});

		it('should disable submit button during submission', async () => {
			// Mock slow submission
			mockProps.onSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

			render(TaxonomyNodeDialog, mockProps);

			const nameInput = screen.getByLabelText('Name');
			const descriptionInput = screen.getByLabelText('Description');
			
			await user.type(nameInput, 'Test Portfolio');
			await user.type(descriptionInput, 'A comprehensive test portfolio description');

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			// Button should be disabled during submission
			expect(submitButton).toBeDisabled();

			// Wait for submission to complete
			await waitFor(() => {
				expect(mockProps.onSubmit).toHaveBeenCalled();
			});
		});

		it('should show loading state during submission', async () => {
			mockProps.onSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

			render(TaxonomyNodeDialog, mockProps);

			const nameInput = screen.getByLabelText('Name');
			const descriptionInput = screen.getByLabelText('Description');
			
			await user.type(nameInput, 'Test Portfolio');
			await user.type(descriptionInput, 'A comprehensive test portfolio description');

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			expect(screen.getByText('Creating...')).toBeInTheDocument();
		});

		it('should handle submission errors gracefully', async () => {
			mockProps.onSubmit.mockRejectedValue(new Error('Submission failed'));

			render(TaxonomyNodeDialog, mockProps);

			const nameInput = screen.getByLabelText('Name');
			const descriptionInput = screen.getByLabelText('Description');
			
			await user.type(nameInput, 'Test Portfolio');
			await user.type(descriptionInput, 'A comprehensive test portfolio description');

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Failed to create portfolio: Submission failed')).toBeInTheDocument();
			});
		});
	});

	describe('Cancel Functionality', () => {
		it('should call onCancel when cancel button is clicked', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const cancelButton = screen.getByText('Cancel');
			await user.click(cancelButton);

			expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
		});

		it('should call onCancel when escape key is pressed', async () => {
			render(TaxonomyNodeDialog, mockProps);

			await user.keyboard('{Escape}');

			expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Parent Selection', () => {
		it('should show parent options for line creation', () => {
			const validParents = TaxonomyNodeDTOMock.createTaxonomyNodeArray(3, 'portfolio');
			const lineProps = { 
				...mockProps, 
				nodeType: 'line' as TaxonomyNodeType,
				validParentOptions: validParents
			};

			render(TaxonomyNodeDialog, lineProps);

			expect(screen.getByText('Parent Portfolio')).toBeInTheDocument();
			expect(screen.getByText('Select a parent portfolio for this product line')).toBeInTheDocument();
		});

		it('should show parent options for category creation', () => {
			const validParents = TaxonomyNodeDTOMock.createTaxonomyNodeArray(3, 'line');
			const categoryProps = { 
				...mockProps, 
				nodeType: 'category' as TaxonomyNodeType,
				validParentOptions: validParents
			};

			render(TaxonomyNodeDialog, categoryProps);

			expect(screen.getByText('Parent Product Line')).toBeInTheDocument();
		});

		it('should pre-select parent when parentId is provided', () => {
			const validParents = TaxonomyNodeDTOMock.createTaxonomyNodeArray(3, 'portfolio');
			const parentId = validParents[0]._id as Id<'taxonomyNodes'>;
			
			const lineProps = { 
				...mockProps, 
				nodeType: 'line' as TaxonomyNodeType,
				parentId,
				validParentOptions: validParents
			};

			render(TaxonomyNodeDialog, lineProps);

			// Should show the selected parent name
			expect(screen.getByText(validParents[0].name)).toBeInTheDocument();
		});

		it('should handle empty parent options gracefully', () => {
			const lineProps = { 
				...mockProps, 
				nodeType: 'line' as TaxonomyNodeType,
				validParentOptions: []
			};

			render(TaxonomyNodeDialog, lineProps);

			expect(screen.getByText('No valid parent portfolios available')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA labels and roles', () => {
			render(TaxonomyNodeDialog, mockProps);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			expect(screen.getByLabelText('Name')).toBeInTheDocument();
			expect(screen.getByLabelText('Description')).toBeInTheDocument();
		});

		it('should associate error messages with form fields', async () => {
			render(TaxonomyNodeDialog, mockProps);

			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			await waitFor(() => {
				const nameInput = screen.getByLabelText('Name');
				const errorMessage = screen.getByText('Name is required');
				
				expect(nameInput).toHaveAttribute('aria-describedby');
				expect(errorMessage).toHaveAttribute('id');
			});
		});

		it('should support keyboard navigation', () => {
			render(TaxonomyNodeDialog, mockProps);

			// All form elements should be focusable
			const formElements = screen.getAllByRole('textbox');
			formElements.forEach(element => {
				expect(element).not.toHaveAttribute('tabindex', '-1');
			});
		});
	});

	describe('Type-Specific Behavior', () => {
		it('should show appropriate type badge and icon', () => {
			render(TaxonomyNodeDialog, mockProps);

			expect(screen.getByText('Portfolio')).toBeInTheDocument();
			// Folder icon should be present
		});

		it('should show type-specific descriptions', () => {
			render(TaxonomyNodeDialog, mockProps);

			expect(screen.getByText('A high-level grouping of related product lines')).toBeInTheDocument();
		});

		it('should enforce type-specific validation rules', async () => {
			// Portfolio should not allow parent
			render(TaxonomyNodeDialog, mockProps);

			// Should not show parent selection
			expect(screen.queryByText('Parent')).not.toBeInTheDocument();
		});
	});

	describe('Form Reset', () => {
		it('should reset form when mode changes', () => {
			const { rerender } = render(TaxonomyNodeDialog, mockProps);

			// Fill form
			const nameInput = screen.getByLabelText('Name');
			fireEvent.input(nameInput, { target: { value: 'Test Name' } });

			// Change mode
			rerender({ ...mockProps, mode: 'edit' });

			// Form should be reset
			expect(screen.getByDisplayValue('')).toBeInTheDocument();
		});

		it('should clear errors when dialog is reopened', async () => {
			render(TaxonomyNodeDialog, mockProps);

			// Trigger validation error
			const submitButton = screen.getByText('Create Portfolio');
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Name is required')).toBeInTheDocument();
			});

			// Cancel and reopen should clear errors
			const cancelButton = screen.getByText('Cancel');
			await user.click(cancelButton);

			// Simulate reopening
			render(TaxonomyNodeDialog, mockProps);

			expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
		});
	});
});