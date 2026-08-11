export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "proxy": {
        "api": {
            "create": "administration/users/create",
            "read": "administration/users/get-users-list",
            "update": "administration/users/update",
            "destroy": "administration/users/delete",
        },
    },

    "fields": [
        "id",

        // fields
        { "name": "created", "type": "date" },
        { "name": "last_activity", "type": "date" },
        { "name": "enabled", "type": "bool" },
        "email",
        { "name": "email_confirmed", "type": "bool" },
        "avatar_url",
        { "name": "roles", "type": "array", "allowNull": true },

        // calculated
        {
            "name": "last_activity_text",
            calculate ( data ) {
                if ( !data.last_activity ) {
                    return "&mdash;";
                }
                else {
                    return Ext.util.Format.date( data.last_activity, "dateStyle:short,timeStyle:short" );
                }
            },
        },
    ],
} );
