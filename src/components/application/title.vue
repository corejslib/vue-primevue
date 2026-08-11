<template>
    <ext-titlebar docked="top" padding="0 0 0 15" :title="title" titleAlign="left">
        <slot name="logo"/>

        <!-- XXX this div is required to align components in slot after title -->
        <div/>

        <slot name="title"/>

        <!-- notifications button -->
        <NotificationsButton align="right" :hidden="!showNotificationsButton"/>

        <!-- avatar -->
        <AvatarUser align="right" height="40" :hidden="!avatarEnabled" width="40"/>

        <!-- menu button -->
        <ext-button align="right" height="50" :hidden="!menuEnabled" iconCls="fa-solid fa-bars" margin="0 0 0 5" width="40" @tap="showMenu"/>

        <AppMenu ref="menu" :changePasswordButtonEnabled="menuChangePasswordButtonEnabled" :pushNotificationsButtonEnabled="menuPushNotificationsButtonEnabled" @showAccountDialog="showAccountDialog">
            <template #top>
                <slot name="menuTop"/>
            </template>

            <template #bottom>
                <slot name="menuBottom"/>
            </template>
        </AppMenu>
    </ext-titlebar>
</template>

<script>
import AvatarUser from "#src/components/avatar.user";
import NotificationsButton from "#src/components/notifications/button";
import AccountDialog from "#vue/components/account/dialog";
import AppMenu from "./menu";

export default {
    "components": { AvatarUser, AppMenu, NotificationsButton },

    "props": {
        "notificationsButtonEnabled": {
            "type": Boolean,
            "default": true,
        },
        "canDeleteNotifications": {
            "type": Boolean,
            "default": false,
        },
        "avatarEnabled": {
            "type": Boolean,
            "default": true,
        },
        "menuEnabled": {
            "type": Boolean,
            "default": true,
        },
        "menuChangePasswordButtonEnabled": {
            "type": Boolean,
            "default": false,
        },
        "menuPushNotificationsButtonEnabled": {
            "type": Boolean,
            "default": false,
        },
    },

    "computed": {
        title () {
            return this.$app.settings.title;
        },

        showNotificationsButton () {
            return this.notificationsButtonEnabled && Ext.os.deviceType !== "Phone";
        },
    },

    "methods": {
        showMenu () {
            this.$refs.menu.show();
        },

        hideMenu () {
            this.$refs.menu.hide();
        },

        async showAccountDialog () {
            const cmp = await this.$mount( AccountDialog );

            cmp.ext.show();
        },
    },
};
</script>
