import { Provider } from '@angular/core';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldDefaultOptions,
} from '@angular/material/form-field';

const matFormFieldDefaultOption: MatFormFieldDefaultOptions = {
    appearance: 'fill',
};

export const thirdPartyProviders: Provider[] = [
    {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: matFormFieldDefaultOption,
    },
];
