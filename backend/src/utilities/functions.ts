export function convertDateFormat(dateString: string) {
  if (!dateString || dateString.length !== 10) {
    throw new Error("Invalid date format, expected yyyy-mm-dd");
  }

  const [year, month, day] = dateString.split("-");

  return `${day}-${month}-${year}`;
}


export function calculateDuration (hourBegin: string, hourEnd: string): number {
  const [startHours, startMinutes] = hourBegin.split(":").map(Number);
  const [endHours, endMinutes] = hourEnd.split(":").map(Number);
  return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
};

export function formatDuration (totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}h${String(minutes).padStart(2, "0")}m`;
};
