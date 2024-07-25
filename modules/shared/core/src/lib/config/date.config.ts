import { MatDateFormats } from '@angular/material/core';

export interface IDateTimeConfig {
    date: string;
    shortDate: string;
    time: string;
    dateTime: string;
    monthYear: string;
}

export enum DATETIME_FORMAT {
    DATE = 'dd-MMM-YYYY',
    SHORT_DATE = 'DD MMM YYYY',
    // DATETIME = 'HH:mm • MMM dd, yyyy',
    DATETIME = 'dd-MMM-yyyy • hh:mm a',
    TIME = 'hh:mm a',
    MONTH_YEAR = 'MMM-YYYY',
}

export const dateTimeConfig: IDateTimeConfig = {
    date: DATETIME_FORMAT.DATE,
    shortDate: DATETIME_FORMAT.SHORT_DATE,
    time: DATETIME_FORMAT.TIME,
    dateTime: DATETIME_FORMAT.DATETIME,
    monthYear: DATETIME_FORMAT.MONTH_YEAR,
};

export const DEFAULT_FORMATS: MatDateFormats = {
    parse: {
        dateInput: 'dd/MM/yyyy',
    },
    display: {
        dateInput: 'dd/MM/yyyy',
        monthYearLabel: 'LLL y',
        dateA11yLabel: 'MMMM d, y',
        monthYearA11yLabel: 'MMMM y',
    },
};

export const MONTHPICKER_FORMATS = {
    parse: {
        dateInput: 'MMM-yyyy',
    },
    display: {
        dateInput: 'MMM-yyyy',
        monthYearLabel: 'LLL y',
        dateA11yLabel: 'MMMM d, y',
        monthYearA11yLabel: 'MMMM y',
    },
};
