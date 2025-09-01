import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './vitest-setup-client.ts',
		include: ['src/**/*.spec.ts', 'src/**/*.spec.svelte']
	},
	resolve: {
		conditions: ['browser']
	}
});
