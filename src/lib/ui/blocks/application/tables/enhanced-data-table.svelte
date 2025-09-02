<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		type SortingState,
		type ColumnFiltersState,
		type VisibilityState
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/ui/components/data-table';
	import * as Table from '$lib/ui/components/table';
	import { Button } from '$lib/ui/components/button';
	import { Input } from '$lib/ui/components/input';
	import * as DropdownMenu from '$lib/ui/components/dropdown-menu';
	import * as Pagination from '$lib/ui/components/pagination';
	import * as Select from '$lib/ui/components/select';
	import {
		ArrowUpDown,
		ArrowUp,
		ArrowDown,
		Search,
		Funnel,
		Settings,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';

	type EnhancedDataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		searchPlaceholder?: string;
		pageSize?: number;
		enableGlobalFilter?: boolean;
		enableColumnFilters?: boolean;
		enableSorting?: boolean;
		enableRowSelection?: boolean;
		enableColumnVisibility?: boolean;
		enablePagination?: boolean;
		initialColumnVisibility?: VisibilityState;
	};

	let {
		columns,
		data,
		searchPlaceholder = 'Search all columns...',
		pageSize = 20,
		enableGlobalFilter = true,
		enableColumnFilters = true,
		enableSorting = true,
		enableRowSelection = true,
		enableColumnVisibility = true,
		enablePagination = true,
		initialColumnVisibility = {}
	}: EnhancedDataTableProps<TData, TValue> = $props();

	// Table state
	let sorting: SortingState = $state([]);
	let columnFilters: ColumnFiltersState = $state([]);
	let columnVisibility: VisibilityState = $state(initialColumnVisibility);
	let globalFilter = $state('');
	let rowSelection = $state({});
	let reactivePagination = $state({
		pageIndex: 0,
		pageSize: pageSize
	});

	const table = $derived(
		createSvelteTable({
			data,
			columns,
			state: {
				sorting,
				columnFilters,
				columnVisibility,
				globalFilter,
				rowSelection,
				pagination: reactivePagination
			},
			onSortingChange: (updater) => {
				sorting = typeof updater === 'function' ? updater(sorting) : updater;
			},
			onColumnFiltersChange: (updater) => {
				columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
			},
			onColumnVisibilityChange: (updater) => {
				columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
			},
			onGlobalFilterChange: (updater) => {
				globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
			},
			onRowSelectionChange: (updater) => {
				rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
			},
			onPaginationChange: (updater) => {
				reactivePagination = typeof updater === 'function' ? updater(reactivePagination) : updater;
			},
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel(),
			getFilteredRowModel: getFilteredRowModel(),
			getPaginationRowModel: getPaginationRowModel(),
			enableRowSelection,
			enableMultiRowSelection: enableRowSelection,
			enableSorting,
			enableColumnFilters,
			enableGlobalFilter,
			globalFilterFn: 'includesString',
			initialState: {}
		})
	);

	function resetFilters() {
		globalFilter = '';
		columnFilters = [];
		sorting = [];
		rowSelection = {};
	}
</script>

<!-- Controls Bar -->
<div class="flex items-center justify-between space-x-4 py-4">
	<!-- Global Search -->
	{#if enableGlobalFilter}
		<div class="flex items-center space-x-2">
			<div class="relative">
				<Search class="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
				<Input placeholder={searchPlaceholder} bind:value={globalFilter} class="max-w-sm pl-8" />
			</div>
		</div>
	{:else}
		<div></div>
	{/if}

	<!-- Table Controls -->
	<div class="flex items-center space-x-2">
		<!-- Column Visibility -->
		{#if enableColumnVisibility}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" size="sm">
						<Settings class="mr-2 h-4 w-4" />
						Columns
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-48">
					{#each table
						.getAllColumns()
						.filter((column) => column.getCanHide()) as column (column.id)}
						<DropdownMenu.Item
							class="flex items-center space-x-2"
							onselect={(e) => e.preventDefault()}
						>
							<input
								type="checkbox"
								checked={column.getIsVisible()}
								onchange={(e) => {
									e.stopPropagation();
									column.toggleVisibility();
								}}
								onclick={(e) => e.stopPropagation()}
								class="rounded"
							/>
							<span>
								<button
									onclick={(e) => {
										e.stopPropagation();
										column.toggleVisibility();
									}}>{column.columnDef.header}</button
								>
							</span>
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}

		<!-- Reset Filters -->
		<Button variant="ghost" size="sm" onclick={resetFilters}>Reset</Button>
	</div>
</div>

<!-- Data Table -->
<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head class="relative">
							{#if !header.isPlaceholder}
								<div class="flex items-center space-x-2">
									{#if header.column.getCanSort() && enableSorting}
										<Button
											variant="ghost"
											size="sm"
											onclick={() => header.column.toggleSorting()}
											class="h-8 data-[state=open]:bg-accent"
										>
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
											{#if header.column.getIsSorted() === 'desc'}
												<ArrowDown class="ml-2 h-4 w-4" />
											{:else if header.column.getIsSorted() === 'asc'}
												<ArrowUp class="ml-2 h-4 w-4" />
											{:else}
												<ArrowUpDown class="ml-2 h-4 w-4 opacity-50" />
											{/if}
										</Button>
									{:else}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}

									{#if header.column.getCanFilter() && enableColumnFilters}
										<DropdownMenu.Root>
											<DropdownMenu.Trigger>
												<Button variant="ghost" size="icon" class="h-6 w-6">
													<Funnel class="h-3 w-3" />
												</Button>
											</DropdownMenu.Trigger>
											<DropdownMenu.Content align="start" class="w-48">
												<div class="p-2">
													<Input
														placeholder={`Filter ${header.column.columnDef.header}...`}
														value={header.column.getFilterValue() ?? ''}
														oninput={(e) => header.column.setFilterValue(e.currentTarget.value)}
														class="h-8"
													/>
												</div>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									{/if}
								</div>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">
						No results found.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<!-- Pagination Controls -->
{#if enablePagination}
	<div class="flex items-center justify-between gap-3 max-sm:flex-col">
		<!-- Page number information -->
		<p class="flex-1 text-sm whitespace-nowrap text-muted-foreground" aria-live="polite">
			Page
			<span class="text-foreground">
				{table.getState().pagination.pageIndex + 1}
			</span>
			of <span class="text-foreground">{table.getPageCount()}</span>
		</p>

		<!-- Pagination buttons -->
		<Pagination.Root
			count={Math.ceil(data.length / reactivePagination.pageSize)}
			page={reactivePagination.pageIndex + 1}
			siblingCount={1}
			perPage={1}
		>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content>
					<Pagination.Item>
						<Button
							size="icon"
							variant="outline"
							class="disabled:pointer-events-none disabled:opacity-50"
							onclick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							aria-label="Go to previous page"
						>
							<ChevronLeft class="size-4" />
						</Button>
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link
									{page}
									isActive={currentPage === page.value}
									onclick={() => {
										reactivePagination.pageIndex = page.value - 1;
										table.setPageIndex(page.value - 1);
									}}
								>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Button
							size="icon"
							variant="outline"
							class="disabled:pointer-events-none disabled:opacity-50"
							onclick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							aria-label="Go to next page"
						>
							<ChevronRight size={16} aria-hidden="true" />
						</Button>
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>

		<!-- Results per page -->
		<div class="flex flex-1 justify-end">
			<Select.Root
				type="single"
				value={table.getState().pagination.pageSize.toString()}
				onValueChange={(value) => {
					reactivePagination.pageSize = Number(value);
				}}
			>
				<Select.Trigger
					id="results-per-page"
					class="w-fit whitespace-nowrap"
					placeholder="Select number of results"
					aria-label="Results per page"
				>
					{reactivePagination.pageSize} / page
				</Select.Trigger>
				<Select.Content>
					{#each [5, 10, 25, 50] as pageSize (pageSize)}
						<Select.Item value={pageSize.toString()}>
							{pageSize} / page
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>
{/if}
