export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "proxy": {
        "api": {
            "read": "acl/get-acl-users-list",
        },
    },

    "fields": [
        "id",

        // fields
        { "name": "acl_id", "type": "integer" },
        { "name": "email", "type": "string" },
        { "name": "avatar_url", "type": "string" },
        { "name": "created", "type": "date" },
        { "name": "enabled", "type": "bool" },
        { "name": "roles", "type": "array", "allowNull": true },
        { "name": "editable", "type": "bool" },
    ],
} );
