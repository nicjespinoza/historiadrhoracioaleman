import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;
    if (!locale || !['en', 'es'].includes(locale)) {
        locale = 'es';
    }

    let messages;
    if (locale === 'en') {
        messages = (await import('../../messages/en.json')).default;
    } else {
        messages = (await import('../../messages/es.json')).default;
    }

    return {
        locale,
        messages
    };
});
