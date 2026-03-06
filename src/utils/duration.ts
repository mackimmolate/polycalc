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

export function formatLeadTimeMinutes(minutesValue: number | null) {
  if (minutesValue === null || !Number.isFinite(minutesValue)) {
    return 'Ej beräknat';
  }

  const totalMinutes = Math.max(0, Math.round(minutesValue));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}
