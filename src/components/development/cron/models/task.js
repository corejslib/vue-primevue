export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "proxy": {
        "api": {
            "read": "development/cron/get-schedule",
        },
    },

    "fields": [
        "id",

        // fields
        "module",
        "name",
        "cron",
        "timezone",
        "query",
        "run_missed",
        { "name": "next_start", "type": "date" },
        { "name": "last_start", "type": "date" },
        { "name": "last_finish", "typ": "date" },
        { "name": "error", "type": "bool" },
        "status_text",
    ],
} );
