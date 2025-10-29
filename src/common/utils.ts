export const mapArrayToIds = <T>(
  array: T[],
  key: keyof T,
): Record<string, T[]> => {
  return array.reduce((acc, item) => {
    // Get the value of the grouping key and ensure it's a string
    const id = String(item[key]);

    // Initialize the array for this key if it doesn't exist
    if (!acc[id]) {
      acc[id] = [];
    }

    // Push the current item into the group
    acc[id].push(item);
    
    return acc;
  }, {} as Record<string, T[]>);
};