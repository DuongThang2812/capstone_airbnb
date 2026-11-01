import { BadRequestException } from '@nestjs/common';

export function parseIsoDate(value: unknown, field: string): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new BadRequestException(`${field} phải là ngày ISO hợp lệ`);
  }
  const calendarDay = value.slice(0, 10);
  const calendar = new Date(`${calendarDay}T00:00:00Z`);
  const date = new Date(value);
  if (Number.isNaN(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== calendarDay || Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${field} không hợp lệ`);
  }
  return date;
}
