import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	test: {
		projects: [
			// Convex backend tests: edge-runtime environment
			{
				test: {
					globals: true,
					environment: 'edge-runtime',
					include: ['src/convex/**/*.test.ts'],
					server: { deps: { inline: ['convex-test'] } },
					setupFiles: ['./vitest-setup-server.ts'] // No jest-dom
				}
			},
			// UI tests: jsdom environment (components, ViewModels, pages)
			{
				plugins: [svelte({ hot: false })],
				test: {
					globals: true,
					environment: 'jsdom',
					include: ['src/**/*.spec.ts', 'src/**/*.spec.svelte', 'src/lib/**/*.test.ts'],
					setupFiles: ['./vitest-setup-client.ts'] // With jest-dom
				},
				resolve: {
					conditions: ['browser']
				}
			}
		]
	}
});
