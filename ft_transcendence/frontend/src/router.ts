
export function navigate(path: string) {
    history.pushState({}, "", path);
    console.log(`Navigated to ${path}`);
}
