const { diffDaysYMD, toDateStringInTimeZone } = require("./dateTime");

const resetStreakIfMissedDays = (user, timezone, todayDate = new Date()) => {
  if (!user.lastCompletionDate) {
    return false;
  }

  const todayYmd = toDateStringInTimeZone(todayDate, timezone);
  const lastYmd = toDateStringInTimeZone(user.lastCompletionDate, timezone);
  const dayGap = diffDaysYMD(lastYmd, todayYmd);

  if (dayGap > 1) {
    user.streakCurrent = 0;
    return true;
  }

  return false;
};

const incrementStreakForToday = (user, timezone, todayDate = new Date()) => {
  const todayYmd = toDateStringInTimeZone(todayDate, timezone);
  const lastYmd = user.lastCompletionDate
    ? toDateStringInTimeZone(user.lastCompletionDate, timezone)
    : null;

  if (lastYmd === todayYmd) {
    return false;
  }

  if (!lastYmd || diffDaysYMD(lastYmd, todayYmd) <= 1) {
    user.streakCurrent += 1;
  } else {
    user.streakCurrent = 1;
  }

  user.streakBest = Math.max(user.streakBest, user.streakCurrent);
  user.lastCompletionDate = new Date(`${todayYmd}T00:00:00.000Z`);
  return true;
};

module.exports = {
  resetStreakIfMissedDays,
  incrementStreakForToday,
};
