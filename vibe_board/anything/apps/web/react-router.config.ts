import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: true,
	// Disable prerendering — server needs DATABASE_URL at render time,
	// which is not available during the Docker build step.
	prerender: false,
} satisfies Config;
