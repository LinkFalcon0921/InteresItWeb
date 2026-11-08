import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'node',
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: 'reports/vitest/junit.xml',
      json: 'reports/vitest/results.json'
    }
  }
});
