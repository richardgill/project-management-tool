import dayjs from 'dayjs'

const isWeekend = (day: dayjs.Dayjs) => {
  return [0, 6].includes(day.day())
}

export const businessDayRange = (day = dayjs.utc().startOf('day'), n = 1000): dayjs.Dayjs[] => {
  if (n === 0) {
    return []
  }
  if (isWeekend(day)) {
    return businessDayRange(day.add(1, 'day'), n)
  }
  return [day, ...businessDayRange(day.add(1, 'day'), n - 1)]
}
