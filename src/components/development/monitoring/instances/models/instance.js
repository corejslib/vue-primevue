import app from "#app";

export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "fields": [
        "id",

        // fields
        "package",
        "service",
        "instance",
        { "name": "created", "type": "date" },
        { "name": "last_updated", "type": "date" },
        "ram_total",
        "ram_used",
        "rss_used",
        "hdd_total",
        "hdd_used",

        // calculates
        { "name": "instance_type", "calculate": data => `${ data.package }/${ data.service }` },

        { "name": "ram_used_text", "calculate": data => `${ app.locale.formatNumber( data.ram_used / 1024 ** 3, "style:unit,unit:gigabyte" ) } ( ${ app.locale.formatPercent( data.ram_used / data.ram_total ) } )` },

        { "name": "rss_used_text", "calculate": data => `${ app.locale.formatNumber( data.rss_used / 1024 ** 3, "style:unit,unit:gigabyte" ) } ( ${ app.locale.formatPercent( data.rss_used / data.ram_total ) } )` },

        { "name": "hdd_used_text", "calculate": data => `${ app.locale.formatNumber( data.hdd_used / 1024 ** 3, "style:unit,unit:gigabyte" ) } ( ${ app.locale.formatPercent( data.hdd_used / data.hdd_total ) } )` },
    ],
} );
