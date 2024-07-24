const plugin = require('tailwindcss/plugin');

const iconSize = plugin(
    ({ addUtilities, theme, e, variants }) => {
        const values = theme('iconSize');

        addUtilities(
            Object.entries(values).map(([key, value]) => {
                const val = `${value} !important`;
                return {
                    [`.${e(`icon-size-${key}`)}`]: {
                        width: val,
                        height: val,
                        minWidth: val,
                        minHeight: val,
                        fontSize: val,
                        lineHeight: val,
                        [`svg`]: {
                            width: val,
                            height: val,
                        },
                    },
                };
            })
        );
    },
    {
        theme: {
            iconSize: {
                2: '0.5rem',
                3: '0.75rem',
                3.5: '0.875rem',
                4: '1rem',
                4.5: '1.125rem',
                5: '1.25rem',
                6: '1.5rem',
                7: '1.75rem',
                8: '2rem',
                10: '2.5rem',
                12: '3rem',
                14: '3.5rem',
                16: '4rem',
                18: '4.5rem',
                20: '5rem',
                22: '5.5rem',
                24: '6rem',
            },
        },
    }
);

module.exports = iconSize;
