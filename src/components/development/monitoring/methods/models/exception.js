export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "proxy": {
        "api": {
            "read": "development/monitoring/methods/get-method-exceptions-list",
        },
    },

    "fields": [

        // fields
        "method_id",
        { "name": "date", "type": "date" },
        "status",
        "status_text",
        "duration",
    ],
} );
