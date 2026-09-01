const AVG_TRACK_MINUTES = 3.5;

function formatDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;
  return `${fmt(start)} até ${fmt(end)}`;
}

function formatDuration(totalMinutes) {
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const parts = [];
  if (days > 0) parts.push(`${days} dia${days > 1 ? "s" : ""}`);
  parts.push(`${hours} hora${hours !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

export function buildSemaninhaMessage({ username, weekNumber, stats }) {
  const dateRange = formatDateRange();
  const avgPerDay = Math.round(stats.totalScrobbles / 7);
  const totalMinutesListened = stats.totalScrobbles * AVG_TRACK_MINUTES;
  const listenedLabel = formatDuration(totalMinutesListened);
  const tagsLine =
    stats.topTags.length > 0
      ? stats.topTags.join(", ")
      : "sem dados suficientes";

  const header = weekNumber
    ? `Semaninha #${String(weekNumber).padStart(
        2,
        "0"
      )} de ${username} (${dateRange})`
    : `Semaninha de ${username} (${dateRange})`;

  return [
    "```",
    `${header} ---------------------------`,
    `Scrobbles: ${stats.totalScrobbles} | Albums: ${stats.totalAlbums} | Artistas: ${stats.totalArtists}`,
    `Tags mais ouvidas: ${tagsLine}`,
    `Média de scrobbles por dia: ${avgPerDay} | Tempo total ouvido: ${listenedLabel}`,
    "```",
  ].join("\n");
}
