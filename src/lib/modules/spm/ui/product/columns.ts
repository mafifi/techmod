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
