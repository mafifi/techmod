<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

	// Intentionally loose typing: forward arbitrary props (including `asChild`) and children
	let { ref = $bindable(null), children: childrenProp, ...restProps }: any = $props();
</script>

<DropdownMenuPrimitive.Trigger bind:ref data-slot="dropdown-menu-trigger" {...restProps}>
	{#snippet children({ builder }: { builder: any })}
		{@render childrenProp?.({ builder })}
	{/snippet}
</DropdownMenuPrimitive.Trigger>
