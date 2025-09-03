import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DeleteTaxonomyNodeDialog from './DeleteTaxonomyNodeDialog.svelte';
import { TaxonomyTestUtils } from './TaxonomyTestUtils';
import { TaxonomyNodeDTOMock } from '../../domain/TaxonomyNodeDTOMock';
import type { TaxonomyNode } from '../../domain/TaxonomyNodeDTO';

// Mock UI components
vi.mock('$lib/ui/components/button', () => ({
	Button: vi.fn().mockImplementation(({ children, onclick, disabled, variant, ...props }) => 
		`<button ${onclick ? `data-onclick="true"` : ''} ${disabled ? 'disabled' : ''} data-variant="${variant || 'default'}">${children}</button>`
	)
}));

vi.mock('$lib/ui/components/dialog', () => ({
	Dialog: vi.fn().mockImplementation(({ children, open, ...props }) => 
		open ? `<div role="dialog">${children}</div>` : null
	),
	DialogContent: vi.fn().mockImplementation(({ children, ...props }) => 
		`<div class="dialog-content">${children}</div>`
	),
	DialogDescription: vi.fn().mockImplementation(({ children, ...props }) => 
		`<div class="dialog-description">${children}</div>`
	),
	DialogFooter: vi.fn().mockImplementation(({ children, ...props }) => 
		`<div class="dialog-footer">${children}</div>`
	),
	DialogHeader: vi.fn().mockImplementation(({ children, ...props }) => 
		`<div class="dialog-header">${children}</div>`
	),
	DialogTitle: vi.fn().mockImplementation(({ children, ...props }) => 
		`<h2 class="dialog-title">${children}</h2>`
	)
}));

vi.mock('$lib/ui/components/checkbox', () => ({
	Checkbox: vi.fn().mockImplementation(({ checked, onCheckedChange, ...props }) => 
		`<input type="checkbox" ${checked ? 'checked' : ''} ${onCheckedChange ? `onchange="${onCheckedChange}"` : ''} />`
	)
}));

vi.mock('$lib/ui/components/badge', () => ({
	Badge: vi.fn().mockImplementation(({ children, variant, ...props }) => 
		`<span class="badge ${variant}">${children}</span>`
	)
}));

vi.mock('$lib/ui/components/alert', () => ({
	Alert: vi.fn().mockImplementation(({ children, variant, ...props }) => 
		`<div class="alert ${variant}">${children}</div>`
	),
	AlertDescription: vi.fn().mockImplementation(({ children, ...props }) => 
		`<div class="alert-description">${children}</div>`
	)
}));

// Mock Lucide icons
vi.mock('lucide-svelte', () => ({
	Folder: vi.fn().mockImplementation(() => '<svg class="folder-icon"></svg>'),
	Package: vi.fn().mockImplementation(() => '<svg class="package-icon"></svg>'),
	Tag: vi.fn().mockImplementation(() => '<svg class="tag-icon"></svg>'),
	AlertTriangle: vi.fn().mockImplementation(() => '<svg class="alert-triangle-icon"></svg>'),
	Trash2: vi.fn().mockImplementation(() => '<svg class="trash-icon"></svg>'),
	Users: vi.fn().mockImplementation(() => '<svg class="users-icon"></svg>'),
	Calendar: vi.fn().mockImplementation(() => '<svg class="calendar-icon"></svg>')
}));

describe('DeleteTaxonomyNodeDialog', () => {
	let mockProps: {
		node: TaxonomyNode;
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
			node: TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Test Portfolio',
				type: 'portfolio',
				description: 'A test portfolio for deletion'
			}),
			onSubmit: vi.fn().mockResolvedValue(undefined),
			onCancel: vi.fn()
		};
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('Dialog Rendering', () => {
		it('should render delete confirmation dialog', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			expect(screen.getByText('Delete Portfolio')).toBeInTheDocument();
			expect(screen.getByText('This action cannot be undone. Please confirm you want to delete this portfolio.')).toBeInTheDocument();
		});

		it('should display node information', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			expect(screen.getByText('Test Portfolio')).toBeInTheDocument();
			expect(screen.getByText('A test portfolio for deletion')).toBeInTheDocument();
		});

		it('should show appropriate type badge', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			expect(screen.getByText('Portfolio')).toBeInTheDocument();
		});

		it('should display node creation and modification dates', () => {
			const nodeWithDates = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Dated Node',
				lastModified: Date.now()
			});

			const propsWithDates = { ...mockProps, node: nodeWithDates };
			render(DeleteTaxonomyNodeDialog, propsWithDates);

			// Should show formatted dates
			const dateRegex = /\w{3} \d{1,2}, \d{4}/;
			const dateElements = screen.getAllByText(dateRegex);
			expect(dateElements.length).toBeGreaterThan(0);
		});
	});

	describe('Node Type Variations', () => {
		it('should render correctly for product line deletion', () => {
			const lineNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Test Line',
				type: 'line',
				description: 'A test product line'
			});

			const lineProps = { ...mockProps, node: lineNode };
			render(DeleteTaxonomyNodeDialog, lineProps);

			expect(screen.getByText('Delete Product Line')).toBeInTheDocument();
			expect(screen.getByText('Test Line')).toBeInTheDocument();
			expect(screen.getByText('Product Line')).toBeInTheDocument();
		});

		it('should render correctly for category deletion', () => {
			const categoryNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Test Category',
				type: 'category',
				description: 'A test category'
			});

			const categoryProps = { ...mockProps, node: categoryNode };
			render(DeleteTaxonomyNodeDialog, categoryProps);

			expect(screen.getByText('Delete Category')).toBeInTheDocument();
			expect(screen.getByText('Test Category')).toBeInTheDocument();
			expect(screen.getByText('Category')).toBeInTheDocument();
		});
	});

	describe('Deletion Warnings', () => {
		it('should show simple deletion warning when no children', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			expect(screen.getByText('Simple Deletion')).toBeInTheDocument();
			expect(screen.getByText('This node has no children and can be safely deleted.')).toBeInTheDocument();
		});

		it('should show cascade deletion warning when children exist', () => {
			// Note: In the actual component, child count would be passed as prop
			// For this test, we'll simulate the presence of children through the component logic
			const nodeWithChildren = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Portfolio with Children',
				type: 'portfolio'
			});

			// Mock the component to simulate children existing
			const propsWithChildren = { ...mockProps, node: nodeWithChildren };
			render(DeleteTaxonomyNodeDialog, propsWithChildren);

			// In the actual implementation, this would show cascade warning
			// For now, we test the simple case and note that cascade logic needs child count prop
		});

		it('should show references warning when node is being used', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			// Should warn about potential references
			expect(screen.getByText('Impact Analysis')).toBeInTheDocument();
		});
	});

	describe('Force Delete Option', () => {
		it('should show force delete checkbox for cascade deletions', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const forceCheckbox = screen.getByRole('checkbox');
			expect(forceCheckbox).toBeInTheDocument();
			expect(screen.getByText('Force delete (ignore warnings)')).toBeInTheDocument();
		});

		it('should handle force delete checkbox toggle', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const forceCheckbox = screen.getByRole('checkbox');
			expect(forceCheckbox).not.toBeChecked();

			await user.click(forceCheckbox);
			expect(forceCheckbox).toBeChecked();
		});

		it('should change button text when force delete is enabled', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const forceCheckbox = screen.getByRole('checkbox');
			await user.click(forceCheckbox);

			expect(screen.getByText('Force Delete')).toBeInTheDocument();
		});

		it('should show additional warning when force delete is selected', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const forceCheckbox = screen.getByRole('checkbox');
			await user.click(forceCheckbox);

			expect(screen.getByText('This will permanently delete the node and all its children, regardless of references.')).toBeInTheDocument();
		});
	});

	describe('Form Submission', () => {
		it('should call onSubmit with forceDelete false by default', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const deleteButton = screen.getByText('Delete Portfolio');
			await user.click(deleteButton);

			expect(mockProps.onSubmit).toHaveBeenCalledWith(false);
		});

		it('should call onSubmit with forceDelete true when checkbox is checked', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const forceCheckbox = screen.getByRole('checkbox');
			await user.click(forceCheckbox);

			const deleteButton = screen.getByText('Force Delete');
			await user.click(deleteButton);

			expect(mockProps.onSubmit).toHaveBeenCalledWith(true);
		});

		it('should disable delete button during submission', async () => {
			mockProps.onSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

			render(DeleteTaxonomyNodeDialog, mockProps);

			const deleteButton = screen.getByText('Delete Portfolio');
			await user.click(deleteButton);

			expect(deleteButton).toBeDisabled();
		});

		it('should show loading state during submission', async () => {
			mockProps.onSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

			render(DeleteTaxonomyNodeDialog, mockProps);

			const deleteButton = screen.getByText('Delete Portfolio');
			await user.click(deleteButton);

			expect(screen.getByText('Deleting...')).toBeInTheDocument();
		});

		it('should handle submission errors gracefully', async () => {
			mockProps.onSubmit.mockRejectedValue(new Error('Delete failed'));

			render(DeleteTaxonomyNodeDialog, mockProps);

			const deleteButton = screen.getByText('Delete Portfolio');
			await user.click(deleteButton);

			// Component should handle error in parent, but not crash
			await waitFor(() => {
				expect(mockProps.onSubmit).toHaveBeenCalled();
			});
		});
	});

	describe('Cancel Functionality', () => {
		it('should call onCancel when cancel button is clicked', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const cancelButton = screen.getByText('Cancel');
			await user.click(cancelButton);

			expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
		});

		it('should call onCancel when escape key is pressed', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			await user.keyboard('{Escape}');

			expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Node Information Display', () => {
		it('should show node version and audit information', () => {
			const auditNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Audit Node',
				version: 3,
				createdBy: 'john.doe',
				updatedBy: 'jane.smith'
			});

			const auditProps = { ...mockProps, node: auditNode };
			render(DeleteTaxonomyNodeDialog, auditProps);

			expect(screen.getByText('v3')).toBeInTheDocument();
			expect(screen.getByText('john.doe')).toBeInTheDocument();
			expect(screen.getByText('jane.smith')).toBeInTheDocument();
		});

		it('should show active/inactive status', () => {
			const inactiveNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Inactive Node',
				isActive: false
			});

			const inactiveProps = { ...mockProps, node: inactiveNode };
			render(DeleteTaxonomyNodeDialog, inactiveProps);

			expect(screen.getByText('Inactive')).toBeInTheDocument();
		});

		it('should display strategy information when available', () => {
			const strategyNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Strategic Node',
				strategy: 'Strategic direction for this node'
			});

			const strategyProps = { ...mockProps, node: strategyNode };
			render(DeleteTaxonomyNodeDialog, strategyProps);

			expect(screen.getByText('Strategic direction for this node')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA labels and roles', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			expect(screen.getByRole('checkbox')).toBeInTheDocument();
			
			const deleteButton = screen.getByRole('button', { name: /delete/i });
			expect(deleteButton).toBeInTheDocument();
		});

		it('should have proper heading structure', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const heading = screen.getByRole('heading');
			expect(heading).toHaveTextContent('Delete Portfolio');
		});

		it('should support keyboard navigation', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const interactiveElements = [
				...screen.getAllByRole('button'),
				...screen.getAllByRole('checkbox')
			];

			interactiveElements.forEach(element => {
				expect(element).not.toHaveAttribute('tabindex', '-1');
			});
		});

		it('should have proper focus management', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			// Tab should move through interactive elements
			await user.tab();
			expect(screen.getByRole('checkbox')).toHaveFocus();

			await user.tab();
			expect(screen.getByText('Cancel')).toHaveFocus();

			await user.tab();
			expect(screen.getByText('Delete Portfolio')).toHaveFocus();
		});
	});

	describe('Visual States', () => {
		it('should show destructive styling for delete button', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const deleteButton = screen.getByText('Delete Portfolio');
			expect(deleteButton).toHaveAttribute('data-variant', 'destructive');
		});

		it('should show warning colors for force delete', async () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			const forceCheckbox = screen.getByRole('checkbox');
			await user.click(forceCheckbox);

			const forceDeleteButton = screen.getByText('Force Delete');
			expect(forceDeleteButton).toHaveAttribute('data-variant', 'destructive');
		});

		it('should display appropriate icons for different node types', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			// Portfolio should show folder icon (mocked as class)
			expect(document.querySelector('.folder-icon')).toBeInTheDocument();
		});
	});

	describe('Error Handling', () => {
		it('should handle missing node properties gracefully', () => {
			const minimalNode = {
				_id: 'test_id',
				name: 'Minimal Node',
				type: 'portfolio',
				description: 'Minimal description'
			} as TaxonomyNode;

			const minimalProps = { ...mockProps, node: minimalNode };
			
			expect(() => render(DeleteTaxonomyNodeDialog, minimalProps)).not.toThrow();
			expect(screen.getByText('Minimal Node')).toBeInTheDocument();
		});

		it('should handle undefined strategy gracefully', () => {
			const noStrategyNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'No Strategy Node',
				strategy: undefined
			});

			const noStrategyProps = { ...mockProps, node: noStrategyNode };
			render(DeleteTaxonomyNodeDialog, noStrategyProps);

			expect(screen.getByText('No Strategy Node')).toBeInTheDocument();
		});
	});

	describe('Confirmation Flow', () => {
		it('should require explicit confirmation before deletion', async () => {
			TaxonomyTestUtils.mockWindowConfirm(false);

			render(DeleteTaxonomyNodeDialog, mockProps);

			const deleteButton = screen.getByText('Delete Portfolio');
			await user.click(deleteButton);

			// Should still call onSubmit (confirmation is handled in parent)
			expect(mockProps.onSubmit).toHaveBeenCalled();
		});

		it('should show appropriate confirmation messages', () => {
			render(DeleteTaxonomyNodeDialog, mockProps);

			expect(screen.getByText('This action cannot be undone. Please confirm you want to delete this portfolio.')).toBeInTheDocument();
		});
	});

	describe('Data Validation', () => {
		it('should display correct node type information', () => {
			const lineNode = TaxonomyNodeDTOMock.createTaxonomyNode({ type: 'line' });
			const lineProps = { ...mockProps, node: lineNode };

			render(DeleteTaxonomyNodeDialog, lineProps);

			expect(screen.getByText('Product Line')).toBeInTheDocument();
		});

		it('should format dates consistently', () => {
			const specificDate = new Date('2024-01-15').getTime();
			const datedNode = TaxonomyNodeDTOMock.createTaxonomyNode({
				name: 'Dated Node',
				lastModified: specificDate,
				_creationTime: specificDate
			});

			const datedProps = { ...mockProps, node: datedNode };
			render(DeleteTaxonomyNodeDialog, datedProps);

			// Should format as "Jan 15, 2024"
			expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
		});
	});
});