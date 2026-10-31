import { BadRequestException } from '@nestjs/common';

export function positiveInt(value: string | undefined, field: string, defaultValue?: number): number {
  if (value === undefined && defaultValue !== undefined) return defaultValue;
  if (value === undefined || !/^[1-9]\d*$/.test(value)) {
    throw new BadRequestException(`${field} phải là số nguyên dương`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new BadRequestException(`${field} không hợp lệ`);
  }
  return parsed;
}
