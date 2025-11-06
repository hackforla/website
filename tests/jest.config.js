module.exports = {
    testEnvironment: 'jsdom',
    rootDir: '../',
    roots: [
        'tests/',
        'assets/js' 
    ],
    transform: {
        "\\.(mjs|js)$": './tests/frontend/transformers/jekyll-js-transformer.js',
    },
    transformIgnorePatterns: ['tests/'], // only transform non-test files
};