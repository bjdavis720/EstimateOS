export function readStoredJson(
  key,
  fallbackValue
) {
  try {
    const savedValue =
      localStorage.getItem(key);

    if (!savedValue) {
      return typeof fallbackValue === "function"
        ? fallbackValue()
        : fallbackValue;
    }

    return JSON.parse(savedValue);
  } catch (error) {
    console.error(
      `Unable to read localStorage key "${key}":`,
      error
    );

    return typeof fallbackValue === "function"
      ? fallbackValue()
      : fallbackValue;
  }
}

export function writeStoredJson(
  key,
  value
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error(
      `Unable to write localStorage key "${key}":`,
      error
    );
  }
}

export function removeStoredValue(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      `Unable to remove localStorage key "${key}":`,
      error
    );
  }
}
