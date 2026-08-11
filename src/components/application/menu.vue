<template>
    <ext-sheet layout="vbox" modal="true" side="right" width="300" @ready="_ready">
        <ext-panel :height="isRoot ? 125 : 110" innerCls="x-tabbar" layout="vbox" padding="10 10 10 30">
            <ext-container layout='{"align":"start","type":"hbox"}'>
                <AvatarUser height="60" width="60"/>
            </ext-container>

            <ext-container :html="email" margin="5 0 0 0" style="font-size: 1.3em; color: white"/>
            <ext-container :hidden="!isRoot" html="root" style="font-size: 1.3em; color: white"/>
        </ext-panel>

        <ext-panel flex="1" layout="vbox" padding="10 10 10 30">
            <slot name="top"/>

            <!-- account buttin -->
            <ext-button :hidden="!showAccountButton" iconCls="fa-regular fa-address-card" padding="0 0 0 1" :text="l10n(`Your account`)" textAlign="left" @tap="showAccountDialog"/>

            <!-- change password button -->
            <ext-button :hidden="!changePasswordButtonEnabled" iconCls="fa-solid fa-asterisk" :text="l10n(`Change password`)" textAlign="left" @tap="showChangePasswordDialog"/>

            <!-- administration button                 -->
            <ext-button :hidden="!showAdministrationButton" :text="l10n(`Administration`)" textAlign="left" @tap="showAdministrationDialog"/>

            <!-- development button                 -->
            <ext-button :hidden="!showDevelopmentButton" :text="l10n(`Development`)" textAlign="left" @tap="showDevelopmentDialog"/>

            <slot name="bottom"/>

            <ext-spacer/>

            <LocaleButton/>

            <!-- push notifications button -->
            <PushNotificationsButton :hidden="!pushNotificationsButtonEnabled" labelWidth="200"/>

            <!-- dark node button -->
            <DarkModeButton labelWidth="200"/>

            <ext-container height="10"/>

            <!-- aboit                 -->
            <ext-button :text="l10n(`About the project`)" textAlign="left" @tap="showAboutDialog"/>

            <!-- sign out                 -->
            <ext-button iconCls="fa-solid fa-sign-out-alt" :text="l10n(`Sign out`)" textAlign="left" @tap="signout"/>
        </ext-panel>
    </ext-sheet>
</template>

<script>
import AboutDialog from "#src/components/about.dialog";
import AvatarUser from "#src/components/avatar.user";
import ChangePasswordDialog from "#src/components/change-password.dialog";
import DarkModeButton from "#src/components/dark-mode.button";
import LocaleButton from "#src/components/locale.button";
import PushNotificationsButton from "#src/components/push-notifications.button";

export default {
    "components": { AvatarUser, LocaleButton, PushNotificationsButton, DarkModeButton },

    "props": {
        "changePasswordButtonEnabled": {
            "type": Boolean,
            "default": false,
        },
        "pushNotificationsButtonEnabled": {
            "type": Boolean,
            "default": false,
        },
    },

    "emits": [ "showAccountDialog" ],

    data () {
        return {
            "email": this.$app.user.email,

            "isRoot": this.$app.user.isRoot,
        };
    },

    "computed": {
        showAccountButton () {
            return Ext.os.deviceType !== "Phone";
        },

        showAdministrationButton () {
            return this.$app.user.permissions.has( "administration:read" ) && Ext.os.deviceType !== "Phone";
        },

        showDevelopmentButton () {
            return this.$app.user.permissions.has( "development:read" ) && Ext.os.deviceType !== "Phone";
        },
    },

    created () {

        // disable viewport gestures, menu can be opened only by button click
        Ext.Viewport.addedSwipeListener = true;
    },

    "methods": {
        _ready ( e ) {
            this.ext = e.detail.cmp;
        },

        show () {
            this.ext.show();
        },

        hide () {
            this.ext.hide();
        },

        async showAccountDialog () {
            this.hide();

            this.$emit( "showAccountDialog" );
        },

        async showChangePasswordDialog () {
            this.hide();

            const cmp = await this.$mount( ChangePasswordDialog );

            cmp.ext.show();
        },

        async showAdministrationDialog () {
            this.hide();

            const module = await import( /* webpackChunkName: "administration" */ "#src/components/administration/dialog" );

            const cmp = await this.$mount( module.default );

            cmp.ext.show();
        },

        async showDevelopmentDialog () {
            this.hide();

            const module = await import( /* webpackChunkName: "development" */ "#src/components/development/dialog" );

            const cmp = await this.$mount( module.default );

            cmp.ext.show();
        },

        signout () {
            this.hide();

            this.$app.signOut();
        },

        async showAboutDialog () {
            this.hide();

            const cmp = await this.$mount( AboutDialog );

            cmp.ext.show();
        },
    },
};
</script>
