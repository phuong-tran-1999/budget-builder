import { Injectable, Optional, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import {
    getYear,
    getMonth,
    getDate,
    getDay,
    format,
    setMonth,
    setDay,
    getDaysInMonth,
    toDate,
    parse,
    addYears,
    addMonths,
    addDays,
} from 'date-fns';

const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;

const WEEK_STARTS_ON = 1;

function range(start: number, end: number): number[] {
    const arr: number[] = [];
    for (let i = start; i <= end; i++) {
        arr.push(i);
    }

    return arr;
}

@Injectable()
export class DateFnsDateAdapter extends DateAdapter<Date> {
    constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string) {
        super();
        super.setLocale(matDateLocale);
    }

    getYear(date: Date): number {
        return getYear(date);
    }

    getMonth(date: Date): number {
        return getMonth(date);
    }

    getDate(date: Date): number {
        return getDate(date);
    }

    getDayOfWeek(date: Date): number {
        return getDay(date);
    }

    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        const map = {
            long: 'LLLL',
            short: 'LLL',
            narrow: 'LLLLL',
        };

        const formatStr = map[style];
        const date = new Date();

        return range(0, 11).map((month) =>
            format(setMonth(date, month), formatStr, {
                locale: this.locale,
            }),
        );
    }

    getDateNames(): string[] {
        return range(1, 31).map((day) => String(day));
    }

    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        const map = {
            long: 'EEEE',
            short: 'E..EEE',
            narrow: 'EEEEE',
        };

        const formatStr = map[style];
        const date = new Date();

        return range(0, 6).map((month) =>
            format(setDay(date, month), formatStr, {
                locale: this.locale,
            }),
        );
    }

    getYearName(date: Date): string {
        return format(date, 'yyyy', {
            locale: this.locale,
        });
    }
    getFirstDayOfWeek(): number {
        return WEEK_STARTS_ON;
    }

    getNumDaysInMonth(date: Date): number {
        return getDaysInMonth(date);
    }

    clone(date: Date): Date {
        return toDate(date);
    }

    createDate(year: number, month: number, date: number): Date {
        return new Date(year, month, date);
    }

    today(): Date {
        return new Date();
    }

    parse(value: any, parseFormat: any): Date | null {
        return parse(value, parseFormat, new Date(), {
            locale: this.locale,
        });
    }

    format(date: Date, displayFormat: any): string {
        return format(date, displayFormat, {
            locale: this.locale,
        });
    }

    addCalendarYears(date: Date, years: number): Date {
        return addYears(date, years);
    }

    addCalendarMonths(date: Date, months: number): Date {
        return addMonths(date, months);
    }

    addCalendarDays(date: Date, days: number): Date {
        return addDays(date, days);
    }

    toIso8601(date: Date): string {
        return date.toISOString();
    }

    isDateInstance(obj: any): boolean {
        return obj instanceof Date;
    }

    isValid(date: Date): boolean {
        return date instanceof Date && !isNaN(date.getTime());
    }

    invalid(): Date {
        return new Date(NaN);
    }

    override deserialize(value: any): Date | null {
        if (typeof value === 'string') {
            if (!value) {
                return null;
            }
            // The `Date` constructor accepts formats other than ISO 8601, so we need to make sure the
            // string is the right format first.
            if (ISO_8601_REGEX.test(value)) {
                const date = new Date(value);
                if (this.isValid(date)) {
                    return date;
                }
            }
        }
        return super.deserialize(value);
    }
}
