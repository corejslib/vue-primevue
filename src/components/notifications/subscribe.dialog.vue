<template>
    <ext-dialog height="300" layout="fit" padding="0 5 5 5" :title="l10n(`Notifications`)" width="300" @ready="_ready">
        <NotificationsSubscribePanel ref="panel" :aclId="aclId"/>
    </ext-dialog>
</template>

<script>
import NotificationsSettingsDialog from "#src/components/notifications/settings.dialog";
import NotificationsSubscribePanel from "#src/components/notifications/subscribe.panel";

export default {
    "components": { NotificationsSubscribePanel },

    "props": {
        "aclId": {
            "type": Number,
            "default": null,
        },
    },

    "methods": {
        _ready ( e ) {
            this.ext = e.detail.cmp;

            this.ext.getHeader().add( [
                {
                    "xtype": "button",
                    "iconCls": "fa-solid fa-cog",
                    "text": l10n( "Settings" ),
                    "tooltip": l10n( "Notifications settings" ),
                    "handler": this.showNotificationsSettingsDialog.bind( this ),
                },
            ] );
        },

        async showNotificationsSettingsDialog () {
            const cmp = await this.$mount( NotificationsSettingsDialog, {
                "props": {
                    "aclId": this.aclId,
                    "onUpdate": ( notification, channel, subscribed ) => this.$refs.panel.onChannelUpdate( notification, channel, subscribed ),
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
