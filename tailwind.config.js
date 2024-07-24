const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join, resolve } = require('path');
const colors = require('tailwindcss/colors');
const generatePalette = require(resolve(
    __dirname,
    './tools/tailwind/generate-palette'
));

const customPalettes = {
    primary: generatePalette('#FF0000'),
    accent: generatePalette('#219653'),
    warn: generatePalette('#FF0000'),
};

const themes = {
    // Default theme is required for theming system to work correctly
    default: {
        primary: customPalettes.primary,
        accent: customPalettes.accent,
        warn: customPalettes.warn,
        'on-warn': {
            500: customPalettes.primary['50'],
        },
    },
    // Rest of the themes will use the 'default' as the base theme
    // and extend them with their given configuration
    brand: {
        primary: customPalettes.brand,
    },
    indigo: {
        primary: {
            ...colors.teal,
            DEFAULT: colors.teal[600],
        },
    },
    rose: {
        primary: colors.rose,
    },
    purple: {
        primary: {
            ...colors.purple,
            DEFAULT: colors.purple[600],
        },
    },
    amber: {
        primary: colors.amber,
    },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
        join(__dirname, 'modules/**/!(*.stories|*.spec).{ts,html}'),
        ...createGlobPatternsForDependencies(__dirname),
    ],
    theme: {
        extend: {
            colors: {
                theme: {
                    current: 'currentColor',
                    transparent: 'transparent',
                    'jungle-green': '#16C0B7',
                    'green-primary': '#36B37E',
                    'gray-primary': '#A6B2B6',
                    dark: '#161E25',
                    line: '#CDD7DF',
                    gray: '#4C5862',
                    background: '#F7F8F9',
                    white: '#FFFFFF',
                    black: '#000000',
                    hint: '#94a3b8',
                },
                line: '#CDD7DF',
            },
        },
    },
    plugins: [
        require(resolve(__dirname, 'tools/tailwind/utilities')),
        require(resolve(__dirname, './tools/tailwind/icon-size')),
        require(resolve(__dirname, './tools/tailwind/theming'))({ themes }),
    ],
};
