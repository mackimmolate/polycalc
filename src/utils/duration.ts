export function formatDurationSeconds(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return 'Ej angivet';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }

  if (minutes > 0) {
    return `${minutes} min ${seconds} s`;
  }

  return `${seconds} s`;
}

export function formatMinutesFromSeconds(totalSeconds: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return 'Ej angivet';
  }

  return `${new Intl.NumberFormat('sv-SE', {
    maximumFractionDigits,
  }).format(totalSeconds / 60)} min`;
}

export function formatHours(hoursValue: number | null) {
  if (hoursValue === null || !Number.isFinite(hoursValue) || hoursValue < 0) {
    return 'Ej angivet';
  }

  return new Intl.NumberFormat('sv-SE', {
    maximumFractionDigits: 2,
  }).format(hoursValue);
}
