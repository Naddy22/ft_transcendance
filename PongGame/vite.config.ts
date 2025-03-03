import { defineConfig } from 'vite';

export default defineConfig({
	assetsInclude: ['**/*.fx'], // Traite les fichiers .fx comme des assets
	server: {
		fs: {
		allow: ['.'], // Autorise l’accès au dossier racine
		},
	},
});