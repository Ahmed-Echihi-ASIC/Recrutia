import SelectData from "../Data/SelectData";

// ==========================
// Retrouve le libellé lisible correspondant à une valeur stockée
// (ex: listName="specialite", value="22" -> "Informatique").
// Si la valeur n'est pas trouvée dans la liste, on retourne la
// valeur brute telle quelle (fallback sûr, pas de "undefined").
// ==========================
export function getLabelFromValue(listName, value) {
  if (!value) return "";

  const list = SelectData[listName];

  if (!Array.isArray(list)) return value;

  const match = list.find((item) => item.value === String(value));

  return match ? match.label : value;
}
