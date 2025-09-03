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
			accessorKey: 'owningSuperDepartment',
			header: 'Super Department',
			cell: ({ row }) => row.getValue('owningSuperDepartment'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Super Department'
			}
		},

		{
			accessorKey: 'productType',
			header: 'Product Type',
			cell: ({ row }) => row.getValue('productType'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Product Type'
			}
		},

		{
			accessorKey: 'lifecycleStatus',
			header: 'Lifecycle Status',
			cell: ({ row }) => row.getValue('lifecycleStatus'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Lifecycle Status'
			}
		},

		{
			accessorKey: 'fleet',
			header: 'Fleet',
			cell: ({ row }) => row.getValue('fleet'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Fleet'
			}
		},

		{
			accessorKey: 'squad',
			header: 'Squad',
			cell: ({ row }) => row.getValue('squad'),
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Squad'
			}
		},

		// Optional columns - can be shown via column visibility
		{
			accessorKey: 'eonids',
			header: 'EON IDs',
			cell: ({ row }) => {
				const eonids = row.getValue('eonids') as string;
				return eonids || 'N/A';
			},
			enableColumnFilter: true,
			meta: {
				displayName: 'EON IDs'
			}
		},

		{
			accessorKey: 'productOverview',
			header: 'Overview',
			cell: ({ row }) => {
				const overview = row.getValue('productOverview') as string;
				return overview.length > 50 ? `${overview.substring(0, 50)}...` : overview;
			},
			enableColumnFilter: true,
			meta: {
				displayName: 'Product Overview'
			}
		},

		{
			accessorKey: 'roadmapLink',
			header: 'Roadmap',
			cell: ({ row }) => {
				const link = row.getValue('roadmapLink') as string;
				return link ? 'View Roadmap' : 'N/A';
			},
			enableColumnFilter: false,
			meta: {
				displayName: 'Roadmap Link'
			}
		},

		// Legacy columns (now optional)
		{
			accessorKey: 'price',
			header: 'Price (Legacy)',
			cell: ({ row }) => {
				const price = row.getValue('price') as number | undefined;
				return price !== undefined ? `$${price.toFixed(2)}` : 'N/A';
			},
			enableSorting: true,
			enableColumnFilter: true,
			meta: {
				displayName: 'Price'
			}
		},

		{
			accessorKey: 'category',
			header: 'Category (Legacy)',
			cell: ({ row }) => {
				const category = row.getValue('category') as string | undefined;
				return category || 'N/A';
			},
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
			meta: {
				displayName: 'Category'
			}
		},

		{
			accessorKey: 'description',
			header: 'Description (Legacy)',
			cell: ({ row }) => {
				const description = row.getValue('description') as string | undefined;
				return description || 'N/A';
			},
			enableColumnFilter: true,
			meta: {
				displayName: 'Description'
			}
		},

		{
			accessorKey: 'modernity',
			header: 'Modernity',
			cell: ({ row }) => {
				const modernity = row.getValue('modernity') as string;
				const badges: Record<string, string> = {
					Migrate: '� Migrate',
					Hold: '⏸️ Hold',
					Continue: '✅ Continue',
					Adopt: '� Adopt',
					Assess: '� Assess'
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
