import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'es'],

    // Used when no locale matches
    defaultLocale: 'es',

    // If this is set to `true`, the language will be included in the URL for the default locale as well.
    // For example, `/` will redirect to `/es`.
    localePrefix: 'always'
});

export const config = {
    // Match all pathnames except for
    // - API routes
    // - Next.js internals (_next)
    // - Static files (ones with a period like .png, .svg)
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
