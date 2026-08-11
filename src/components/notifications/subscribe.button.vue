<template>
    <ext-container :hidden="hidden" @ready="_ready">
        <ext-button ref="button" iconCls="fa-regular fa-eye" :text="l10n(`Watch`)" :ui="ui" @tap="showNotificationsSubscribeDialog"/>
    </ext-container>
</template>

<script>
import NotificationsSubscribeDialog from "#src/components/notifications/subscribe.dialog";

export default {
    "props": {
        "aclId": {
            "type": Number,
            "default": null,
        },
        "hidden": {
            "type": Boolean,
            "default": false,
        },
        "ui": {
            "type": String,
            "default": "",
        },
    },

    "methods": {
        _ready ( e ) {
            this.ext = e.detail.cmp;
        },

        async showNotificationsSubscribeDialog () {
            const dialog = await this.$mount( NotificationsSubscribeDialog, {
                "props": {
                    "centered": false,
                    "aclId": this.aclId,
                },
            } );

            dialog.ext.showBy( this.ext, "tr-br" );
        },
    },
};
</script>
