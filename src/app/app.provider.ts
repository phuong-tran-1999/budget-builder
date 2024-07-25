import { Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { DateFnsDateAdapter, DEFAULT_FORMATS } from '@modules/shared/core';
import { enUS } from 'date-fns/locale';

const matFormFieldDefaultOption: MatFormFieldDefaultOptions = {
    appearance: 'fill',
};

export const thirdPartyProviders: Provider[] = [
    {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: matFormFieldDefaultOption,
    },
    {
        provide: DateAdapter,
        useClass: DateFnsDateAdapter,
    },
    {
        provide: MAT_DATE_FORMATS,
        useValue: DEFAULT_FORMATS,
    },

    {
        provide: MAT_DATE_LOCALE,
        useValue: enUS,
    },
];
