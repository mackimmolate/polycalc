const SAVED_CATEGORIES_KEY = 'polyflow.savedMaterialCategories';
const SAVED_MANUFACTURERS_KEY = 'polyflow.savedMaterialManufacturers';

interface MaterialOptionPreferences {
  categories: string[];
  manufacturers: string[];
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStringArray(key: string) {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  } catch {
    return [];
  }
}

function writeStringArray(key: string, values: string[]) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // Ignore storage write failures and keep runtime behavior intact.
  }
}

export function loadSavedMaterialOptionPreferences(): MaterialOptionPreferences {
  return {
    categories: readStringArray(SAVED_CATEGORIES_KEY),
    manufacturers: readStringArray(SAVED_MANUFACTURERS_KEY),
  };
}

export function saveSavedMaterialCategories(categories: string[]) {
  writeStringArray(SAVED_CATEGORIES_KEY, categories);
}

export function saveSavedMaterialManufacturers(manufacturers: string[]) {
  writeStringArray(SAVED_MANUFACTURERS_KEY, manufacturers);
}
