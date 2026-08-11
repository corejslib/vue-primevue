export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "fields": [
        "id",

        // fields
        "package",
        "component",
        "method",
        "calls",
        "duration_per_call",
        "exceptions",
        "exceptions_per_call",
        "calls_share",
        "duration_share",
        "exceptions_share",

        // calculated
        {
            "name": "method_display_name",
            "calculate": data => `${ data.method }<br/>${ data.package } / ${ data.component }`,
        },

        {
            "name": "method_name",
            "calculate": data => ( data.package + "/" + data.component + "/" + data.method ).replaceAll( /\/{2,}/gv, "/" ),
        },

        {
            "name": "calls_text",
            "calculate": data => data.calls + " / " + Ext.util.Format.percent( data.calls_share, "minimumFractionDigits:1,maximumFractionDigits:1" ),
        },

        {
            "name": "duration_text",
            "calculate": data => Ext.util.Format.percent( data.duration_share, "minimumFractionDigits:1,maximumFractionDigits:1" ),
        },

        {
            "name": "duration_per_call_text",
            "calculate": data => Ext.util.Format.number( data.duration_per_call, "minimumFractionDigits:1,maximumFractionDigits:1" ),
        },

        {
            "name": "exceptions_text",
            "calculate": data => data.exceptions + " / " + Ext.util.Format.percent( data.exceptions_share, "minimumFractionDigits:1,maximumFractionDigits:1" ),
        },

        {
            "name": "exceptions_per_call_text",
            "calculate": data => Ext.util.Format.percent( data.exceptions_per_call, "minimumFractionDigits:1,maximumFractionDigits:1" ),
        },
    ],
} );
