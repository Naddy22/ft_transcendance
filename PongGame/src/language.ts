export let currentLanguage = "fr"; // 🌍 Langue par défaut

// 📥 Charge le fichier JSON de la langue choisie
export function loadLanguage(lang: string): Promise<Record<string, string>> {
	return fetch(`/locales/${lang}.json`)
		.then(response => response.json())
		.then(translations => {
			currentLanguage = lang;
			localStorage.setItem("language", lang); // 🔄 Sauvegarde la langue choisie
			return translations; // Renvoie les traductions
		})
		.catch(error => {
			console.error("❌ Erreur chargement langue :", error);
			return {}; // Retourne un objet vide en cas d'erreur
		});
}

// 🌐 Remplace les textes dans le HTML
export function applyTranslations(translations: Record<string, string>) {
	// Met à jour le texte des éléments ayant l'attribut data-i18n
	document.querySelectorAll("[data-i18n]").forEach(el => {
		const key = el.getAttribute("data-i18n")!;
		if (translations[key]) {
			el.textContent = translations[key];
		}
	});

	// Met à jour les placeholders des inputs ayant data-i18n-placeholder
	document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
		const key = el.getAttribute("data-i18n-placeholder")!;
		if (translations[key]) {
			(el as HTMLInputElement).placeholder = translations[key];
		}
	});
}