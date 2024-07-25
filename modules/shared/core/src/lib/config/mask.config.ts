import { IConfig } from 'ngx-mask';

export const maskConfigFunction: () => Partial<IConfig> = () => {
    return {
        validation: false,
        thousandSeparator: ',',
        separatorLimit: '999999999999999',
        decimalMarker: '.',
    };
};
