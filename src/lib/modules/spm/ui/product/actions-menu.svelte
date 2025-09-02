<script lang="ts">
	import { Button } from '$lib/ui/components/button';
	import * as DropdownMenu from '$lib/ui/components/dropdown-menu';
	import { MoreHorizontal, Eye, Edit, Trash } from '@lucide/svelte';

	interface Props {
		id: string;
		handleShow: (id: string) => void;
		handleEdit: (id: string) => void;
		handleDelete: (id: string) => void;
	}

	let { id, handleShow, handleEdit, handleDelete }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="ghost" class="h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<MoreHorizontal class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => handleShow(id)} class="cursor-pointer">
			<Eye class="mr-2 h-4 w-4" />
			View Details
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => handleEdit(id)} class="cursor-pointer">
			<Edit class="mr-2 h-4 w-4" />
			Edit
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			onclick={() => handleDelete(id)}
			class="cursor-pointer text-destructive focus:text-destructive"
		>
			<Trash class="mr-2 h-4 w-4" />
			Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
