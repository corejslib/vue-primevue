<template>
    <ext-tabpanel defaults='{"padding":"0 10 0 10"}' layout='{"animation":{"direction":"vertical","type":"slide"}}' tabBar='{"defaults":{"flex":null,"height":40,"padding":"0 10 0 0","textAlign":"right","width":200},"layout":{"align":"start","pack":"start","type":"vbox"}}' tabBarPosition="left" tabRotation="none" @ready="_ready">
        <!-- security -->
        <ext-panel layout="fit" padding="0 0 0 0" :title="l10n(`Account`)">
            <AccountPanel flex="1"/>
        </ext-panel>

        <!-- notifications -->
        <ext-panel layout="fit" :title="l10n(`Notifications`)">
            <ext-toolbar docked="top">
                <ext-container :html="l10n(`Notifications settings`)"/>
            </ext-toolbar>

            <NotificationsSettingsPanel/>
        </ext-panel>

        <!-- tokens -->
        <ext-panel iconAlign="left" iconCls="fa-solid fa-key" layout="fit" :title="l10n(`API access tokens`)">
            <UserTokensPanel/>
        </ext-panel>

        <!-- appearance -->
        <ext-panel layout="vbox" :title="l10n(`Appearance`)" viewModel="true">
            <ext-toolbar docked="top">
                <ext-container :html="l10n(`Appearance`)"/>
            </ext-toolbar>

            <AppearancePanel/>
        </ext-panel>

        <slot name="tabs"/>
    </ext-tabpanel>
</template>

<script>
import NotificationsSettingsPanel from "#src/components/notifications/settings.panel";
import AccountPanel from "./account.panel";
import AppearancePanel from "./appearance.panel";
import UserTokensPanel from "./tokens/panel";

export default {
    "components": { AccountPanel, NotificationsSettingsPanel, UserTokensPanel, AppearancePanel },

    "methods": {
        _ready ( e ) {
            const cmp = e.detail.cmp,
                tabBar = cmp.getTabBar();

            tabBar.add( [
                {
                    "xtype": "container",
                    "layout": "center",
                    "margin": "10 0 20 0",
                    "height": 70,
                    "docked": "top",
                    "items": [
                        {
                            "xtype": "avatar",
                            "src": this.$app.user.avatarUrl,
                            "width": 60,
                            "height": 60,
                        },
                    ],
                },
            ] );
        },
    },
};
</script>
