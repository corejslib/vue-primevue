import app from "#app";
import telegramComponents from "#src/components/telegram/components";

export default Ext.define( null, {
    "extend": "Ext.data.Model",

    "fields": [
        "id",

        // fields
        "acl_id",
        { "name": "acl_user_permissions", "convert": value => app.user.permissions.addPermissions( value ) },
        "type",
        { "name": "static", "type": "bool" },
        { "name": "deleted", "type": "bool" },
        "locales",
        { "name": "created", "type": "date" },

        "name",
        "short_description",
        "description",
        "avatar_url",

        "username",
        { "name": "telegram_can_join_groups", "type": "bool" },
        { "name": "telegram_can_read_all_group_messages", "type": "bool" },
        { "name": "telegram_supports_inline_queries", "type": "bool" },

        { "name": "last_user_created", "type": "date" },
        "total_users",
        "total_subscribed_users",
        "total_unsubscribed_users",
        "total_returned_users",
        "total_disabled_users",

        { "name": "started", "type": "bool" },
        { "name": "error", "type": "bool" },
        "error_text",

        // calculated
        { "name": "type_name", "calculate": data => telegramComponents.get( data.type )?.name },

        { "name": "can_update", "calculate": data => data.acl_user_permissions.has( "telegram/bot:update" ) },
        { "name": "can_update_acl", "calculate": data => data.acl_user_permissions.has( "acl:update" ) },
        { "name": "can_delete", "calculate": data => !data.static && data.acl_user_permissions.has( "telegram/bot:delete" ) },
        { "name": "can_change_api_token", "calculate": data => !data.static && data.acl_user_permissions.has( "telegram/bot:update" ) },
        { "name": "can_start", "calculate": data => data.acl_user_permissions.has( "telegram/bot:update" ) && !data.started },
        { "name": "can_stop", "calculate": data => data.acl_user_permissions.has( "telegram/bot:update" ) && data.started },

        { "name": "can_create_link", "calculate": data => data.acl_user_permissions.has( "telegram/bot/links:create" ) },
        { "name": "can_read_links", "calculate": data => data.acl_user_permissions.has( "telegram/bot/links:read" ) },
        { "name": "can_update_link", "calculate": data => data.acl_user_permissions.has( "telegram/bot/links:update" ) },
        { "name": "can_delete_link", "calculate": data => data.acl_user_permissions.has( "telegram/bot/links:delete" ) },

        {
            "name": "status_text",
            "calculate": data => {
                return data.started
                    ? l10n( "Bot started" )
                    : l10n( "Bot stopped" );
            },
        },

        {
            "name": "last_user_created_text",
            calculate ( data ) {
                if ( data.last_user_created ) {
                    return `${ app.locale.formatDate( data.last_user_created ) } (${ app.locale.formatRelativeDate( data.last_user_created ) })`;
                }
                else {
                    return "--";
                }
            },
        },

        // subscribed users
        {
            "name": "total_subscribed_users_percent",
            "calculate": data => {
                return data.total_users
                    ? data.total_subscribed_users / data.total_users
                    : 0;
            },
        },
        { "name": "total_subscribed_users_percent_text", "calculate": data => app.locale.formatPercent( data.total_subscribed_users_percent ) },

        { "name": "total_subscribed_users_text", "calculate": data => `${ data.total_subscribed_users } (${ data.total_subscribed_users_percent_text })` },

        // unsubscribed users
        {
            "name": "total_unsubscribed_users_percent",
            "calculate": data => {
                return data.total_users
                    ? data.total_unsubscribed_users / data.total_users
                    : 0;
            },
        },

        { "name": "total_unsubscribed_users_percent_text", "calculate": data => app.locale.formatPercent( data.total_unsubscribed_users_percent ) },

        { "name": "total_unsubscribed_users_text", "calculate": data => `${ data.total_unsubscribed_users } (${ data.total_unsubscribed_users_percent_text })` },

        // returned users
        {
            "name": "total_returned_users_percent",
            "calculate": data => {
                return data.total_users
                    ? data.total_returned_users / data.total_users
                    : 0;
            },
        },

        { "name": "total_returned_users_percent_text", "calculate": data => app.locale.formatPercent( data.total_returned_users_percent ) },

        { "name": "total_returned_users_text", "calculate": data => `${ data.total_returned_users } (${ data.total_returned_users_percent_text })` },

        // disabled users
        {
            "name": "total_disabled_users_percent",
            "calculate": data => {
                return data.total_users
                    ? data.total_disabled_users / data.total_users
                    : 0;
            },
        },

        { "name": "total_disabled_users_percent_text", "calculate": data => app.locale.formatPercent( data.total_disabled_users_percent ) },

        { "name": "total_disabled_users_text", "calculate": data => `${ data.total_disabled_users } (${ data.total_disabled_users_percent_text })` },

        { "name": "url", "calculate": data => `https://t.me/${ data.username }` },
    ],
} );
