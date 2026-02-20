const toDateStringInTimeZone = (date, timezone) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
};

const dateFromYMD = (ymd) => new Date(`${ymd}T00:00:00.000Z`);

const getTodayInTimeZone = (timezone) => {
  const ymd = toDateStringInTimeZone(new Date(), timezone);
  return dateFromYMD(ymd);
};

const getTimePartsInTimeZone = (date, timezone) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    ymd: `${map.year}-${map.month}-${map.day}`,
  };
};

const diffDaysYMD = (startYmd, endYmd) => {
  const start = dateFromYMD(startYmd).getTime();
  const end = dateFromYMD(endYmd).getTime();
  return Math.floor((end - start) / (24 * 60 * 60 * 1000));
};

module.exports = {
  toDateStringInTimeZone,
  dateFromYMD,
  getTodayInTimeZone,
  getTimePartsInTimeZone,
  diffDaysYMD,
};
