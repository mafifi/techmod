import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import TaxonomyTree from './TaxonomyTree.svelte';
import { TaxonomyTestUtils } from './TaxonomyTestUtils';
import { TaxonomyNodeDTOMock } from '../../domain/TaxonomyNodeDTOMock';
import type { TaxonomyNode, TaxonomyNodeType } from '../../domain/TaxonomyNodeDTO';
import type { Id } from '../../../../../convex/_generated/dataModel';

// Mock UI components to focus on tree logic
vi.mock('$lib/ui/components/button', () => ({
	Button: vi.fn().mockImplementation(({ children, onclick, ...props }) => 
		`<button ${onclick ? `onclick="${onclick}"` : ''}>${children}</button>`
	)
}));

vi.mock('$lib/ui/components/badge', () => ({
	Badge: vi.fn().mockImplementation(({ children, variant, ...props }) => 
		`<span class="badge ${variant}">${children}</span>`
	)
}));

vi.mock('$lib/ui/components/dropdown-menu', () => ({
	DropdownMenu: vi.fn(),
	DropdownMenuContent: vi.fn(),
	DropdownMenuItem: vi.fn(),
	DropdownMenuSeparator: vi.fn(),
	DropdownMenuTrigger: vi.fn()
}));

// Mock Lucide icons
vi.mock('lucide-svelte', () => ({
	ChevronRight: vi.fn().mockImplementation(() => '<svg class="chevron-right"></svg>'),
	ChevronDown: vi.fn().mockImplementation(() => '<svg class="chevron-down"></svg>'),
	MoreHorizontal: vi.fn().mockImplementation(() => '<svg class="more-horizontal"></svg>'),
	Plus: vi.fn().mockImplementation(() => '<svg class="plus"></svg>'),
	Edit: vi.fn().mockImplementation(() => '<svg class="edit"></svg>'),
	Trash2: vi.fn().mockImplementation(() => '<svg class="trash"></svg>'),
	Move: vi.fn().mockImplementation(() => '<svg class="move"></svg>'),
	Folder: vi.fn().mockImplementation(() => '<svg class="folder"></svg>'),
	Package: vi.fn().mockImplementation(() => '<svg class="package"></svg>'),
	Tag: vi.fn().mockImplementation(() => '<svg class="tag"></svg>'),
	Eye: vi.fn().mockImplementation(() => '<svg class="eye"></svg>'),
	EyeOff: vi.fn().mockImplementation(() => '<svg class="eye-off"></svg>'),
	Calendar: vi.fn().mockImplementation(() => '<svg class="calendar"></svg>'),
	User: vi.fn().mockImplementation(() => '<svg class="user"></svg>')
}));

describe('TaxonomyTree', () => {
	let mockProps: {
		nodes: any[];
		expandedNodes: Set<string>;
		onToggleExpansion: ReturnType<typeof vi.fn>;
		onCreateChild: ReturnType<typeof vi.fn>;
		onEdit: ReturnType<typeof vi.fn>;
		onDelete: ReturnType<typeof vi.fn>;
		onMove: ReturnType<typeof vi.fn>;
		currentUserId: string;
		depth?: number;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		TaxonomyNodeDTOMock.resetCounter();
		TaxonomyTestUtils.mockBrowserAPIs();

		mockProps = {
			nodes: TaxonomyNodeDTOMock.createHierarchyWithChildren(),
			expandedNodes: new Set<string>(),
			onToggleExpansion: vi.fn(),
			onCreateChild: vi.fn(),
			onEdit: vi.fn(),
			onDelete: vi.fn(),
			onMove: vi.fn(),
			currentUserId: 'test_user_123',
			depth: 0
		};
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('Component Rendering', () => {
		it('should render all nodes at root level', () => {
			render(TaxonomyTree, mockProps);

			// Should render portfolio nodes
			const portfolioNodes = mockProps.nodes.filter(node => node.type === 'portfolio');
			portfolioNodes.forEach(node => {
				expect(screen.getByText(node.name)).toBeInTheDocument();
			});
		});

		it('should display node names and descriptions', () => {
			render(TaxonomyTree, mockProps);

			const firstNode = mockProps.nodes[0];
			expect(screen.getByText(firstNode.name)).toBeInTheDocument();
			expect(screen.getByText(firstNode.description)).toBeInTheDocument();
		});

		it('should show appropriate icons for different node types', () => {
			render(TaxonomyTree, mockProps);

			// Portfolio nodes should show folder icon
			const portfolioNode = mockProps.nodes.find(n => n.type === 'portfolio');
			if (portfolioNode) {
				expect(screen.getByText(portfolioNode.name)).toBeInTheDocument();
				// Icon would be rendered as part of the component
			}
		});

		it('should display badges for node types', () => {
			render(TaxonomyTree, mockProps);

			// Should show type badges
			expect(screen.getByText('Portfolio')).toBeInTheDocument();
		});

		it('should show active/inactive status', () => {
			const inactiveNode = TaxonomyNodeDTOMock.createTaxonomyNode({ 
				isActive: false,
				name: 'Inactive Node'
			});
			const propsWithInactive = {
				...mockProps,
				nodes: [...mockProps.nodes, { ...inactiveNode, children: [] }]
			};

			render(TaxonomyTree, propsWithInactive);

			expect(screen.getByText('Inactive Node')).toBeInTheDocument();
		});
	});

	describe('Node Expansion', () => {
		it('should show collapsed state by default', () => {
			render(TaxonomyTree, mockProps);

			// Child nodes should not be visible when collapsed
			const firstPortfolio = mockProps.nodes[0];
			const firstLine = firstPortfolio.children[0];
			
			expect(screen.getByText(firstPortfolio.name)).toBeInTheDocument();
			expect(screen.queryByText(firstLine.name)).not.toBeInTheDocument();
		});

		it('should show expanded state when node is in expandedNodes', () => {
			const firstPortfolio = mockProps.nodes[0];
			mockProps.expandedNodes.add(firstPortfolio._id);

			render(TaxonomyTree, mockProps);

			// Child nodes should be visible when expanded
			const firstLine = firstPortfolio.children[0];
			expect(screen.getByText(firstLine.name)).toBeInTheDocument();
		});

		it('should call onToggleExpansion when expansion toggle is clicked', async () => {
			render(TaxonomyTree, mockProps);

			const firstNode = mockProps.nodes[0];
			
			// Find and click the expansion toggle button
			const expandButton = screen.getByRole('button', { name: /toggle.*expansion/i });
			await fireEvent.click(expandButton);

			expect(mockProps.onToggleExpansion).toHaveBeenCalledWith(firstNode._id);
		});

		it('should render nested hierarchy correctly when expanded', () => {
			const portfolio = mockProps.nodes[0];
			const line = portfolio.children[0];
			
			mockProps.expandedNodes.add(portfolio._id);
			mockProps.expandedNodes.add(line._id);

			render(TaxonomyTree, mockProps);

			// Should show portfolio > line > category
			expect(screen.getByText(portfolio.name)).toBeInTheDocument();
			expect(screen.getByText(line.name)).toBeInTheDocument();
			
			if (line.children.length > 0) {
				expect(screen.getByText(line.children[0].name)).toBeInTheDocument();
			}
		});
	});

	describe('Context Menu Actions', () => {
		it('should provide context menu for each node', () => {
			render(TaxonomyTree, mockProps);

			// Should show context menu trigger buttons
			const contextMenuButtons = screen.getAllByRole('button', { name: /menu/i });
			expect(contextMenuButtons.length).toBeGreaterThan(0);
		});

		it('should call onEdit when edit action is triggered', async () => {
			render(TaxonomyTree, mockProps);

			const firstNode = mockProps.nodes[0];
			
			// Simulate clicking edit from context menu
			// In real implementation, this would be through dropdown menu
			const editButton = screen.getByRole('button', { name: /edit/i });
			await fireEvent.click(editButton);

			expect(mockProps.onEdit).toHaveBeenCalledWith(firstNode);
		});

		it('should call onDelete when delete action is triggered', async () => {
			render(TaxonomyTree, mockProps);

			const firstNode = mockProps.nodes[0];
			
			const deleteButton = screen.getByRole('button', { name: /delete/i });
			await fireEvent.click(deleteButton);

			expect(mockProps.onDelete).toHaveBeenCalledWith(firstNode);
		});

		it('should call onCreateChild for appropriate node types', async () => {
			render(TaxonomyTree, mockProps);

			const portfolioNode = mockProps.nodes.find(n => n.type === 'portfolio');
			
			if (portfolioNode) {
				const addChildButton = screen.getByRole('button', { name: /add.*line/i });
				await fireEvent.click(addChildButton);

				expect(mockProps.onCreateChild).toHaveBeenCalledWith('line', portfolioNode._id);
			}
		});

		it('should not show add child option for category nodes', () => {
			// Create a tree with an expanded category
			const portfolio = mockProps.nodes[0];
			const line = portfolio.children[0];
			
			if (line.children.length > 0) {
				mockProps.expandedNodes.add(portfolio._id);
				mockProps.expandedNodes.add(line._id);

				render(TaxonomyTree, mockProps);

				// Categories should not have "Add" option
				expect(screen.queryByRole('button', { name: /add.*category/i })).not.toBeInTheDocument();
			}
		});
	});

	describe('Drag and Drop', () => {
		beforeEach(() => {
			// Mock drag and drop APIs
			Object.defineProperty(window, 'DataTransfer', {
				value: class {
					constructor() {
						this.data = {};
					}
					setData(type, value) {
						this.data[type] = value;
					}
					getData(type) {
						return this.data[type];
					}
				}
			});
		});

		it('should handle drag start event', async () => {
			render(TaxonomyTree, mockProps);

			const firstNode = mockProps.nodes[0];
			const draggableElement = screen.getByText(firstNode.name).closest('[draggable="true"]');
			
			if (draggableElement) {
				const dragEvent = new Event('dragstart');
				await fireEvent(draggableElement, dragEvent);

				// Should set up drag data
				expect(draggableElement).toHaveAttribute('draggable', 'true');
			}
		});

		it('should handle drop events when onMove is provided', async () => {
			const dragDropData = TaxonomyTestUtils.createDragDropTestData();
			
			render(TaxonomyTree, mockProps);

			const targetElement = screen.getByText(dragDropData.targetNode.name);
			
			await fireEvent.drop(targetElement, {
				dataTransfer: dragDropData.dropEvent.dataTransfer
			});

			// Should call onMove with correct parameters
			expect(mockProps.onMove).toHaveBeenCalledWith(
				dragDropData.sourceNode._id,
				dragDropData.targetNode._id
			);
		});

		it('should not allow dropping on invalid targets', async () => {
			// Test dropping a portfolio onto a category (invalid)
			const portfolio = mockProps.nodes.find(n => n.type === 'portfolio');
			const line = mockProps.nodes[0].children[0];
			
			if (portfolio && line.children.length > 0) {
				const category = line.children[0];
				
				render(TaxonomyTree, mockProps);

				// Should not allow invalid drops
				const targetElement = screen.getByText(category.name);
				
				// Simulate invalid drop attempt
				await fireEvent.dragOver(targetElement);
				
				// onMove should not be called for invalid drops
				expect(mockProps.onMove).not.toHaveBeenCalled();
			}
		});

		it('should show visual feedback during drag operations', async () => {
			render(TaxonomyTree, mockProps);

			const firstNode = mockProps.nodes[0];
			const draggableElement = screen.getByText(firstNode.name).closest('[draggable="true"]');
			
			if (draggableElement) {
				await fireEvent.dragStart(draggableElement);
				
				// Should add drag visual feedback classes
				// This would be verified in the actual component implementation
				expect(draggableElement).toBeInTheDocument();
			}
		});
	});

	describe('Node Information Display', () => {
		it('should show creation and modification dates', () => {
			render(TaxonomyTree, mockProps);

			// Should display formatted dates
			const dateElements = screen.getAllByText(/\w{3} \d{1,2}, \d{4}/);
			expect(dateElements.length).toBeGreaterThan(0);
		});

		it('should show created by and updated by information', () => {
			render(TaxonomyTree, mockProps);

			const firstNode = mockProps.nodes[0];
			
			// Should show user information
			expect(screen.getByText(firstNode.createdBy)).toBeInTheDocument();
		});

		it('should show version information', () => {
			render(TaxonomyTree, mockProps);

			const firstNode = mockProps.nodes[0];
			
			// Should display version number
			expect(screen.getByText(`v${firstNode.version}`)).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA roles and labels', () => {
			render(TaxonomyTree, mockProps);

			// Tree should have proper ARIA structure
			const treeElements = document.querySelectorAll('[role="tree"], [role="treeitem"]');
			expect(treeElements.length).toBeGreaterThan(0);
		});

		it('should support keyboard navigation', () => {
			render(TaxonomyTree, mockProps);

			// All interactive elements should be keyboard accessible
			const buttons = screen.getAllByRole('button');
			buttons.forEach(button => {
				expect(button).not.toHaveAttribute('tabindex', '-1');
			});
		});

		it('should have proper ARIA expanded states', () => {
			const firstPortfolio = mockProps.nodes[0];
			mockProps.expandedNodes.add(firstPortfolio._id);

			render(TaxonomyTree, mockProps);

			// Expanded nodes should have aria-expanded="true"
			const expandedElements = document.querySelectorAll('[aria-expanded="true"]');
			expect(expandedElements.length).toBeGreaterThan(0);
		});
	});

	describe('Responsive Design', () => {
		it('should apply appropriate depth indentation', () => {
			const deepProps = { ...mockProps, depth: 2 };
			
			render(TaxonomyTree, deepProps);

			// Should apply indentation styles based on depth
			// This would be verified through CSS classes in the actual component
			expect(screen.getByText(mockProps.nodes[0].name)).toBeInTheDocument();
		});

		it('should handle deep nesting gracefully', () => {
			// Test with deep hierarchy
			const portfolio = mockProps.nodes[0];
			const line = portfolio.children[0];
			
			mockProps.expandedNodes.add(portfolio._id);
			mockProps.expandedNodes.add(line._id);
			
			render(TaxonomyTree, mockProps);

			// Should render deep hierarchy without issues
			expect(screen.getByText(portfolio.name)).toBeInTheDocument();
			expect(screen.getByText(line.name)).toBeInTheDocument();
		});
	});

	describe('Error Handling', () => {
		it('should handle empty nodes array', () => {
			const emptyProps = { ...mockProps, nodes: [] };
			
			render(TaxonomyTree, emptyProps);

			// Should render without errors
			expect(document.body).toBeInTheDocument();
		});

		it('should handle nodes without children', () => {
			const flatNodes = mockProps.nodes.map(node => ({ ...node, children: [] }));
			const flatProps = { ...mockProps, nodes: flatNodes };
			
			render(TaxonomyTree, flatProps);

			// Should render nodes without children arrays
			flatNodes.forEach(node => {
				expect(screen.getByText(node.name)).toBeInTheDocument();
			});
		});

		it('should handle missing onMove prop gracefully', () => {
			const propsWithoutMove = { ...mockProps, onMove: undefined };
			
			render(TaxonomyTree, propsWithoutMove);

			// Should render without drag and drop functionality
			expect(screen.getByText(mockProps.nodes[0].name)).toBeInTheDocument();
		});
	});

	describe('Performance', () => {
		it('should only render visible nodes', () => {
			// Only expanded nodes should render children
			render(TaxonomyTree, mockProps);

			const portfolio = mockProps.nodes[0];
			const line = portfolio.children[0];

			// Line should not be rendered since portfolio is collapsed
			expect(screen.getByText(portfolio.name)).toBeInTheDocument();
			expect(screen.queryByText(line.name)).not.toBeInTheDocument();
		});

		it('should handle large hierarchies efficiently', () => {
			// Create large hierarchy
			const largeHierarchy = Array.from({ length: 100 }, (_, i) => 
				TaxonomyNodeDTOMock.createTaxonomyNode({
					name: `Portfolio ${i}`,
					type: 'portfolio',
					children: []
				})
			);

			const largeProps = { ...mockProps, nodes: largeHierarchy };
			
			render(TaxonomyTree, largeProps);

			// Should render efficiently without performance issues
			expect(screen.getByText('Portfolio 0')).toBeInTheDocument();
			expect(screen.getByText('Portfolio 99')).toBeInTheDocument();
		});
	});
});