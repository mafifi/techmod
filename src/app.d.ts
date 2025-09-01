// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import '@testing-library/jest-dom';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			Env: {
				PUBLIC_CONVEX_URL: string;
			};
		}
	}
}

export {};
