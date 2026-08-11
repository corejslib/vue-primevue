export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "fields": [
        "id",

        // fields
        "email",
        { "name": "email_confirmed", "type": "bool" },
    ],
} );
