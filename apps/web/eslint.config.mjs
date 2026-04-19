// Placeholder ESLint config for ESLint 9 flat-config.
//
// NOTE: next/core-web-vitals has a known circular-reference issue when loaded
// via FlatCompat against ESLint 9 + Next 16. Wave 2 polish worker will migrate
// to the native flat config once @next/eslint-plugin-next ships proper flat
// exports. For now, linting is deferred — typecheck + build are the gates.
//
// Do not add rules here until the Next plugin compatibility lands.
export default []
