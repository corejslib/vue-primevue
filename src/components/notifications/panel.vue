<template>
    <ext-tabpanel flex="1" layout='{"animation":{"direction":"vertical","type":"slide"}}' tabBar='{"defaults":{"flex":null,"height":"100"},"layout":{"align":"start","pack":"start","type":"vbox"}}' tabBarPosition="left" @ready="_ready">
        <!-- inbox             -->
        <ext-panel layout="fit" :title="l10n(`Inbox`)">
            <InboxPanel/>
        </ext-panel>

        <!-- done -->
        <ext-panel iconAlign="left" iconCls="fa-solid fa-check" layout="fit" :title="l10n(`Done`)">
            <DonePanel/>
        </ext-panel>
    </ext-tabpanel>
</template>

<script>
import DonePanel from "#src/components/notifications/done.panel";
import InboxPanel from "#src/components/notifications/inbox.panel";

export default {
    "components": { InboxPanel, DonePanel },

    "computed": {
        totalInbox () {
            return this.$app.notifications.totalInbox;
        },

        totalDone () {
            return this.$app.notifications.totalDone;
        },
    },

    "watch": {
        "totalInbox": "_setInboxBadgeText",

        "totalDone": "_setDoneBadgeText",
    },

    "methods": {
        showInbox () {
            this.ext.setActiveItem( 0 );
        },

        _ready ( e ) {
            this.ext = e.detail.cmp;

            this._inboxTab = this.ext.getTabBar().getTabs()[ 0 ];
            this._doneTab = this.ext.getTabBar().getTabs()[ 1 ];

            this._setInboxBadgeText();
            this._setDoneBadgeText();
        },

        _setInboxBadgeText () {
            this._inboxTab.setBadgeText( this.totalInbox || "" );
        },

        _setDoneBadgeText () {
            this._doneTab.setBadgeText( this.totalDone || "" );
        },
    },
};
</script>
