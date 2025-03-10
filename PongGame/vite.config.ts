import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',  // Ensure assets are referenced from the root URL
	assetsInclude: ['**/*.fx'], // Traite les fichiers .fx comme des assets
	server: {
		fs: {
		allow: ['.'], // Autorise l’accès au dossier racine
		},
	},
});
