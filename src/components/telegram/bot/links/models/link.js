import app from "#app";

export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "proxy": {
        "api": {
            "read": "telegram/bots/links/get-links-list",
        },
    },

    "fields": [
        "id",

        // fields
        "name",
        "description",
        "link",
        { "name": "created", "type": "date" },
        { "name": "last_user_created", "type": "date" },

        "total_users",
        "total_subscribed_users",
        "total_unsubscribed_users",
        "total_returned_users",
        "total_disabled_users",

        // calculated
        { "name": "description_html", "calculate": data => data.description?.replaceAll( "\n", "<br/>" ) },

        { "name": "created_text", "calculate": data => app.locale.formatDate( data.created, "dateStyle:short,timeStyle:short" ) },
        { "name": "created_relative", "calculate": data => app.locale.formatRelativeDate( data.created ) },
        { "name": "created_html", "calculate": data => `${ data.created_text } (${ data.created_relative })` },

        {
            "name": "last_user_created_text",
            "calculate": data => {
                return data.last_user_created
                    ? app.locale.formatDate( data.created, "dateStyle:short,timeStyle:short" )
                    : "--";
            },
        },
        {
            "name": "last_user_created_relative",
            "calculate": data => {
                return data.last_user_created
                    ? app.locale.formatRelativeDate( data.created )
                    : "--";
            },
        },
        {
            "name": "last_user_created_html",
            calculate ( data ) {
                if ( data.last_user_created ) {
                    return `${ data.created_text } (${ data.created_relative })`;
                }
                else {
                    return "--";
                }
            },
        },

        // subscribed users
        {
            "name": "total_subscribed_users_percent",
            calculate ( data ) {
                if ( data.total_users ) {
                    return data.total_subscribed_users / data.total_users;
                }
                else {
                    return 0;
                }
            },
        },

        { "name": "total_subscribed_users_percent_text", "calculate": data => app.locale.formatPercent( data.total_subscribed_users_percent ) },

        { "name": "total_subscribed_users_text", "calculate": data => `${ data.total_subscribed_users } (${ data.total_subscribed_users_percent_text })` },

        // unsubscribed users
        {
            "name": "total_unsubscribed_users_percent",
            calculate ( data ) {
                if ( data.total_users ) {
                    return data.total_unsubscribed_users / data.total_users;
                }
                else {
                    return 0;
                }
            },
        },

        { "name": "total_unsubscribed_users_percent_text", "calculate": data => app.locale.formatPercent( data.total_unsubscribed_users_percent ) },

        { "name": "total_unsubscribed_users_text", "calculate": data => `${ data.total_unsubscribed_users } (${ data.total_unsubscribed_users_percent_text })` },

        // returned users
        {
            "name": "total_returned_users_percent",
            calculate ( data ) {
                if ( data.total_users ) {
                    return data.total_returned_users / data.total_users;
                }
                else {
                    return 0;
                }
            },
        },

        { "name": "total_returned_users_percent_text", "calculate": data => app.locale.formatPercent( data.total_returned_users_percent ) },

        { "name": "total_returned_users_text", "calculate": data => `${ data.total_returned_users } (${ data.total_returned_users_percent_text })` },

        // disabled users
        {
            "name": "total_disabled_users_percent",
            calculate ( data ) {
                if ( data.total_users ) {
                    return data.total_disabled_users / data.total_users;
                }
                else {
                    return 0;
                }
            },
        },

        { "name": "total_disabled_users_percent_text", "calculate": data => app.locale.formatPercent( data.total_disabled_users_percent ) },

        { "name": "total_disabled_users_text", "calculate": data => `${ data.total_disabled_users } (${ data.total_disabled_users_percent_text })` },
    ],
} );
