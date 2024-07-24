const plugin = require('tailwindcss/plugin');

const utilities = plugin(({ addComponents }) => {
    /*
     * Add base components. These are very important for everything to look
     * correct. We are adding these to the 'components' layer because they must
     * be defined before pretty much everything else.
     */
    addComponents(
        {
            '.mat-icon': {
                '--tw-text-opacity': '1',
                color: 'rgba(var(--red-mat-icon-rgb), var(--tw-text-opacity))',
            },
            '.text-hint': {
                '--tw-text-opacity': '1 !important',
                color: 'rgba(var(--red-text-hint-rgb), var(--tw-text-opacity)) !important',
            },
            '.text-default': {
                '--tw-text-opacity': '1 !important',
                color: 'rgba(var(--red-text-default-rgb), var(--tw-text-opacity)) !important',
            },
            '.bg-card': {
                '--tw-bg-opacity': '1 !important',
                backgroundColor:
                    'rgba(var(--red-bg-card-rgb), var(--tw-bg-opacity)) !important',
            },
            '.bg-default': {
                '--tw-bg-opacity': '1 !important',
                backgroundColor:
                    'rgba(var(--red-bg-default-rgb), var(--tw-bg-opacity)) !important',
            },
        },
        {
            variants: ['dark', 'responsive', 'group-hover', 'hover'],
        }
    );

    addComponents(
        {
            '.bg-hover': {
                backgroundColor: 'var(--red-bg-hover) !important',
            },
        },
        {
            variants: ['dark', 'group-hover', 'hover'],
        }
    );
});

module.exports = utilities;
