export let currentLanguage = "fr";

// Loads the JSON file for the selected language
export function loadLanguage(lang: string): Promise<Record<string, string>> {
	return fetch(`/locales/${lang}.json`)
		.then(response => response.json())
		.then(translations => {
			currentLanguage = lang;
			localStorage.setItem("language", lang);
			localStorage.setItem("translations", JSON.stringify(translations));
			return translations;
		})
		.catch(error => {
			console.error("❌ Error loadlanguage:", error);
			return {};
		});
}

export function applyTranslations(translations: Record<string, string>) {
	// Updates the text of elements with the data-i18n attribute
	document.querySelectorAll("[data-i18n]").forEach(el => {
		const key = el.getAttribute("data-i18n")!;
		if (translations[key]) {
			el.textContent = translations[key];
		}
	});

	// Updates input placeholders with data-i18n-placeholder
	document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
		const key = el.getAttribute("data-i18n-placeholder")!;
		if (translations[key]) {
			(el as HTMLInputElement).placeholder = translations[key];
		}
	});
}

export function getTranslation(key: string): string {
	const translations = JSON.parse(localStorage.getItem("translations") || "{}");
	return translations[key] || key; // Returns the key if the translation does not exist
}

export function getErrorMessage(error: string): string {
	const errorTranslations: Record<string, string> = {
		// 📌 General
		"Failed to fetch": getTranslation("errorFetch"),
		
		// 📌 Register
		"Username is already taken": getTranslation("errorUsernameTaken"),
		"Email is already registered": getTranslation("errorEmailTaken"),
		"Password must be at least 8 characters long": getTranslation("errorPasswordShort"),

		// 📌 Login
		"Invalid username or email": getTranslation("errorInvalidUsernameEmail"),
		"Invalid password": getTranslation("errorInvalidPassword"),
		"This account is anonymized": getTranslation("errorAnonymizedAccount"),

		// 📌 Update Password
		"New password must be at least 8 characters long.": getTranslation("errorNewPasswordShort"),
		"Old password is incorrect.": getTranslation("errorOldPasswordWrong"),

		// 📌 2FA
		"Invalid 2FA code": getTranslation("error2faInvalidCode"),

		// 📌 Friends
		"Cannot add yourself as a friend": getTranslation("errorAddYourself"),
		"Friend already added": getTranslation("errorFriendAlreadyAdded"),
	};

	for (const key in errorTranslations) {
		if (error.includes(key)) { 
			return errorTranslations[key];
		}
	}

	const errorCodeMatch = error.match(/Error\s*(\d+)/);
	if (errorCodeMatch) {
		return getTranslation("errorGeneric").replace("{code}", errorCodeMatch[1]);
	}
	return error;
}
