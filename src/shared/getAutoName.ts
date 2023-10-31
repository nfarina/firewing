import pluralize from "pluralize";

/**
 * Generates a unique but consistent document name based on a collection name.
 */
export function getAutoName(collectionPath: string) {
  const collectionParts = collectionPath.split("/"); // "reports/xyz/expense_reports" => ["reports", "xyz", "expense_reports"]
  const lastPath = collectionParts[collectionParts.length - 1]; // "expense_reports"
  const wordParts = splitWords(lastPath);
  const lastWord = wordParts[wordParts.length - 1]; // "reports"
  return pluralize.singular(lastWord); // "report"
}

function splitWords(str: string): string[] {
  if (str.includes("_")) {
    return str.split("_"); // "expense_reports" => ["expense", "reports"]
  } else {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .toLowerCase()
      .split("_"); // "expenseReports" => ["expense", "reports"],
  }
}
