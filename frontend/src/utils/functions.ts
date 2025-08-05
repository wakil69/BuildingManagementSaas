function deepEqual(
  obj1: Record<string, any>,
  obj2: Record<string, any>
): boolean {
  if (obj1 === obj2) return true;

  if (
    obj1 == null ||
    typeof obj1 !== "object" ||
    obj2 == null ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

function compareArraysOfObjects(arr1: [], arr2: []) {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (!deepEqual(arr1[i], arr2[i])) return false;
  }

  return true;
}

function convertDateFormat(dateString: string) {
  if (!dateString || dateString.length !== 10) {
    return null;
  }

  const [year, month, day] = dateString.split("-");

  return `${day}-${month}-${year}`;
}

function sumDurations(sessions: { hour_begin: string; hour_end: string }[]) {
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  let totalMinutes = 0;

  sessions.forEach(
    ({ hour_begin, hour_end }: { hour_begin: string; hour_end: string }) => {
      const startMinutes = timeToMinutes(hour_begin);
      const endMinutes = timeToMinutes(hour_end);
      totalMinutes += endMinutes - startMinutes;
    }
  );

  return minutesToTime(totalMinutes);
}

export { compareArraysOfObjects, convertDateFormat, sumDurations };
