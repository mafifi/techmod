import type { ColumnDef } from '@tanstack/table-core';
import type { Product } from '../../domain/ProductDTO';
import { renderComponent } from '$lib/ui/components/data-table';
import ActionsCell from './actions-menu.svelte';

// Action handlers type - these would be passed from the parent component
type ActionHandlers = {
	handleShow: (id: string) => void;
	handleEdit: (id: string) => void;
	handleDelete: (id: string) => void;
};

export function createColumns(handlers: ActionHandlers): ColumnDef<Product>[] {
	return [
		// Essential columns - visible by default
		{
			accessorKey: 'name',
			header: 'Product Name',
			cell: ({ row }) => row.getValue('name'),
			enableSorting: true,
			enableColumnFilter: true
		},

		{
			accessorKey: 'category',
			header: 'Category',
			cell: ({ row }) => row.getValue('category'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Category'
			}
		},

		{
			accessorKey: 'price',
			header: 'Price',
			cell: ({ row }) => {
				const price = row.getValue('price') as number;
				return `$${price.toFixed(2)}`;
			},
			enableSorting: true,
			enableColumnFilter: true
		},

		// Optional columns - can be shown via column visibility
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => {
				const description = row.getValue('description') as string;
				return description || 'N/A';
			},
			enableColumnFilter: true,
			meta: {
				displayName: 'Description'
			}
		},

		{
			accessorKey: 'productOwner',
			header: 'Product Owner',
			cell: ({ row }) => row.getValue('productOwner'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => {
				const owner = row.getValue(id) as string;
				return owner.toLowerCase().includes(value.toLowerCase());
			},
			meta: {
				displayName: 'Product Owner'
			}
		},

		{
			accessorKey: 'department',
			header: 'Department',
			cell: ({ row }) => row.getValue('department'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Department'
			}
		},

		{
			accessorKey: 'superDepartment',
			header: 'Super Department',
			cell: ({ row }) => row.getValue('superDepartment'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Super Department'
			}
		},

		{
			accessorKey: 'modernity',
			header: 'Modernity',
			cell: ({ row }) => {
				const modernity = row.getValue('modernity') as string;
				const badges: Record<string, string> = {
					LEGACY: '🔴 Legacy',
					TRANSITIONAL: '🟡 Transitional',
					MODERN: '🟢 Modern',
					CUTTING_EDGE: '🚀 Cutting Edge'
				};
				return badges[modernity] || modernity;
			},
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Modernity Level'
			}
		},

		{
			accessorKey: 'businessCriticality',
			header: 'Criticality',
			cell: ({ row }) => {
				const criticality = row.getValue('businessCriticality') as string;
				if (!criticality) return 'N/A';
				const badges: Record<string, string> = {
					LOW: '🟢 Low',
					MEDIUM: '🟡 Medium',
					HIGH: '🟠 High',
					CRITICAL: '🔴 Critical'
				};
				return badges[criticality] || criticality;
			},
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Business Criticality'
			}
		},

		{
			accessorKey: 'lifecycleStage',
			header: 'Lifecycle',
			cell: ({ row }) => {
				const stage = row.getValue('lifecycleStage') as string;
				if (!stage) return 'N/A';
				const badges: Record<string, string> = {
					PLAN: '📋 Plan',
					BUILD: '🔨 Build',
					RUN: '⚡ Run',
					RETIRE: '📦 Retire'
				};
				return badges[stage] || stage;
			},
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Lifecycle Stage'
			}
		},

		{
			accessorKey: 'pdr',
			header: 'PDR',
			cell: ({ row }) => {
				const pdr = row.getValue('pdr') as string;
				if (!pdr) return 'N/A';
				return `<a href="${pdr}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">View PDR</a>`;
			},
			enableColumnFilter: false,
			meta: {
				displayName: 'Portfolio Decision Record'
			}
		},

		{
			accessorKey: 'lastAssessmentDate',
			header: 'Last Assessment',
			cell: ({ row }) => {
				const lastAssessment = row.getValue('lastAssessmentDate') as number;
				return lastAssessment ? new Date(lastAssessment).toLocaleDateString() : 'N/A';
			},
			enableSorting: true,
			meta: {
				displayName: 'Last Assessment Date'
			}
		},

		{
			accessorKey: 'nextReviewDate',
			header: 'Next Review',
			cell: ({ row }) => {
				const nextReview = row.getValue('nextReviewDate') as number;
				if (!nextReview) return 'N/A';

				const reviewDate = new Date(nextReview);
				const today = new Date();
				const isOverdue = reviewDate < today;
				const isUpcoming = reviewDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

				let className = '';
				if (isOverdue) className = 'text-red-600 font-semibold';
				else if (isUpcoming) className = 'text-orange-600';

				return `<span class="${className}">${reviewDate.toLocaleDateString()}</span>`;
			},
			enableSorting: true,
			meta: {
				displayName: 'Next Review Date'
			}
		},

		{
			accessorKey: '_creationTime',
			header: 'Created',
			cell: ({ row }) => {
				const creationTime = row.getValue('_creationTime') as number;
				return creationTime ? new Date(creationTime).toLocaleDateString() : 'N/A';
			},
			enableSorting: true,
			meta: {
				displayName: 'Created Date'
			}
		},

		// Actions column
		{
			id: 'actions',
			header: 'Actions',
			enableHiding: false,
			enableSorting: false,
			cell: ({ row }) => {
				return renderComponent(ActionsCell, {
					id: row.original._id,
					handleShow: handlers.handleShow,
					handleEdit: handlers.handleEdit,
					handleDelete: handlers.handleDelete
				});
			}
		}
	];
}
