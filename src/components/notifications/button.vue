<template>
    <ext-container :hidden="_hidden" @ready="_ready">
        <ext-button ref="button" iconCls="fa-regular fa-bell" margin="10 20 0 0" ui="action" width="55" @tap="showNotificationsDialog"/>

        <NotificationsDialog ref="notificationsDialog" centered="false" closeAction="hide"/>
    </ext-container>
</template>

<script>
import NotificationsDialog from "#src/components/notifications/dialog";

export default {
    "components": { NotificationsDialog },

    "props": {
        "hidden": {
            "type": Boolean,
            "default": false,
        },
    },

    "computed": {
        totalInbox () {
            return this.$app.notifications.totalInbox;
        },

        _hidden () {
            return !this.$app.notifications.internalNotificationsEnabled || this.hidden;
        },
    },

    "watch": {
        "totalInbox": "_setNotificationsBadgeText",
    },

    "methods": {
        _ready ( e ) {
            this.ext = e.detail.cmp;

            this._setNotificationsBadgeText();
        },

        showNotificationsDialog () {
            this.$refs.notificationsDialog.ext.showBy( this.ext, "tr-br" );

            this.$app.notifications.refreshRelativeTime();
        },

        _setNotificationsBadgeText () {
            this.$refs.button.ext.setBadgeText( this.$app.notifications.totalInbox || "" );
        },
    },
};
</script>
