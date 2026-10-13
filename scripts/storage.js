const STORAGE_KEY = 'campus_life_planner_records_v1';
const SETTINGS_KEY = 'campus_life_planner_settings_v1';

export function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load records', e);
    return null;
  }
}

export function saveData(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
}

export function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function validateImportJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { valid: false, error: 'Imported JSON must be an array of records.' };
    }
    for (const item of parsed) {
      if (!item.id || !item.title || typeof item.duration !== 'number' || !item.tag || !item.date) {
        return { valid: false, error: 'Invalid record schema in import file.' };
      }
    }
    return { valid: true, data: parsed };
  } catch (e) {
    return { valid: false, error: 'Malformed JSON syntax.' };
  }
}