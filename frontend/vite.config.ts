import { defineConfig } from 'vite';

export default defineConfig({
	assetsInclude: ['**/*.fx'],
	server: {
		fs: {
		allow: ['.'],
		},
	},
});