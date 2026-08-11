import app from "#app";

var locale;

try {
    locale = await import( `@amcharts/amcharts5/locales/${ app.locale.id.replace( "-", "_" ) }.js` );
}
catch {
    locale = await import( "@amcharts/amcharts5/locales/en.js" );
}

const patch = {
    ...locale,
    "_date": { "year": "numeric", "month": "short", "day": "numeric" },
    "_date_millisecond": { "minute": "numeric", "second": "numeric", "fractionalseconddigits": 3 },
    "_date_millisecond_full": { "hour": "numeric", "minute": "numeric", "second": "numeric", "fractionalseconddigits": 3 },
    "_date_second": { "hour": "numeric", "minute": "numeric", "second": "numeric" },
    "_date_second_full": { "hour": "numeric", "minute": "numeric", "second": "numeric" },
    "_date_minute": { "hour": "numeric", "minute": "numeric" },
    "_date_minute_full": {
        "year": "numeric",
        "month": "short",
        "day": "numeric",
        "hour": "numeric",
        "minute": "numeric",
    },
    "_date_hour": { "hour": "numeric", "minute": "numeric" },
    "_date_hour_full": {
        "year": "numeric",
        "month": "short",
        "day": "numeric",
        "hour": "numeric",
        "minute": "numeric",
    },
    "_date_day": { "month": "short", "day": "numeric" },
    "_date_day_full": { "year": "numeric", "month": "short", "day": "numeric" },
    "_date_week": "ww",
    "_date_week_full": { "year": "numeric", "month": "short", "day": "numeric" },
    "_date_month": { "month": "short" },
    "_date_month_full": { "year": "numeric", "month": "short" },
    "_date_year": { "year": "numeric" },
};

export default patch;
