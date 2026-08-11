import app from "#app";

export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "proxy": {
        "api": {
            "read": "telegram/bots/users/get-users-list",
        },
    },

    "fields": [
        "id",

        // fields
        "telegram_bot_id",
        "avatar_url",
        { "name": "is_bot", "type": "bool" },
        "username",
        "first_name",
        "last_name",
        "phone",
        { "name": "created", "type": "date" },
        { "name": "last_activity", "type": "date" },
        { "name": "subscribed", "type": "bool" },
        { "name": "returned", "type": "bool" },
        { "name": "enabled", "type": "bool" },
        "api_user_id",
        "api_user_email",
        "api_user_avatar_url",

        // calculated
        {
            "name": "full_name",
            calculate ( data ) {
                return [ data.first_name, data.last_name ].join( " " );
            },
        },

        {
            "name": "phone_text",
            calculate ( data ) {
                return data.phone || "--";
            },
        },

        {
            "name": "subscription_status",
            calculate ( data ) {
                if ( data.subscribed ) {
                    return l10n( "User subscribed" );
                }
                else {
                    return l10n( "User unsubscribed" );
                }
            },
        },

        {
            "name": "created_text",
            calculate ( data ) {
                return `${ app.locale.formatDate( data.created, "dateStyle:short" ) } (${ app.locale.formatRelativeDate( data.created ) })`;
            },
        },

        {
            "name": "last_activity_text",
            calculate ( data ) {
                return `${ app.locale.formatDate( data.last_activity, "dateStyle:short" ) } (${ app.locale.formatRelativeDate( data.last_activity ) })`;
            },
        },
    ],
} );
