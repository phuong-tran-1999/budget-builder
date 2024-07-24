import { IConfig } from 'ngx-mask';

export const maskConfigFunction: () => Partial<IConfig> = () => {
    return {
        validation: false,
        separatorLimit: '999999999999999',
        decimalMarker: '.',
    };
};
