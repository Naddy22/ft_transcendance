
export async function clearFields(...fields: HTMLInputElement[]): Promise<void> {
  fields.forEach(field => field.value = "");
}
/*
clearFields(regUsername, regEmail, regPassword);
*/
