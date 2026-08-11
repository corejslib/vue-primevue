<template>
    <ext-dialog height="500" layout="fit" :title="l10n(`Notifications settings`)" width="700">
        <NotificationsSettingsPanel :aclId="aclId" @update="_onUpdate"/>
    </ext-dialog>
</template>

<script>
import NotificationsSettingsPanel from "#src/components/notifications/settings.panel";

export default {
    "components": { NotificationsSettingsPanel },

    "props": {
        "aclId": {
            "type": Number,
            "default": null,
        },
    },

    "emits": [ "update" ],

    "methods": {
        _onUpdate ( notification, channel, subscribed ) {
            this.$emit( "update", notification, channel, subscribed );
        },
    },
};
</script>
