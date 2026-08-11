<template>
    <CardsPanel ref="cardsPanel" @refresh="refresh">
        <template #dataPanel>
            <ext-panel layout="vbox">
                <ext-container :hidden="!userRecord" layout='{"align":"center","pack":"center","type":"hbox"}'>
                    <ext-avatar :src="userRecord?.get(`avatar_url`)"/>
                    <ext-spacer width="10"/>
                    <ext-container :html="userRecord?.get(`email`)"/>
                </ext-container>

                <ext-grid ref="grid" columnMenu="false" columnResize="false" flex="1" itemConfig='{"viewModel":true}' multicolumnSort="true" :store="store">
                    <ext-toolbar docked="top">
                        <ext-searchfield :placeholder="l10n(`Search roles`)" width="200" @change="_searchRoles"/>
                        <ext-spacer/>
                        <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                    </ext-toolbar>

                    <ext-column cell='{"encodeHtml":false}' dataIndex="title_html" flex="1" sorter='{"property":"name"}' :text="l10n(`Role`)"/>

                    <ext-column align="center" sorter='{"property":"enabled"}' :text="l10n(`Role enabled`)" width="160" @ready="_enabledColReady"/>
                </ext-grid>
            </ext-panel>
        </template>
    </CardsPanel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import RoleModel from "./models/role";

export default {
    "components": { CardsPanel },

    "props": {
        "aclId": {
            "type": Number,
            "required": true,
        },
        "userId": {
            "type": Number,
            "default": null,
        },
        "userRecord": {
            "type": Object,
            "default": null,
        },
    },

    "emits": [ "update" ],

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "model": RoleModel,
            "remoteFilter": false,
            "remoteSort": false,
            "sorters": { "property": "name", "direction": "asc" },
        } );
    },

    "methods": {

        // public
        async refresh () {
            if ( !this.aclId ) return;

            this.$refs.cardsPanel.mask();

            this.store.loadRawData( [] );

            const res = await this.$api.call( "acl/get-acl-user-roles", ...( this.userId
                ? [ this.aclId, this.userId ]
                : [ this.aclId ] ) );

            this.$refs.cardsPanel.unmask();

            this.$refs.cardsPanel.setResult( res );

            if ( !res.ok ) {
                this.$toast( res );
            }
            else {
                this.store.loadRawData( res.data );
            }
        },

        getEnabledRoles () {
            var roles;

            this.store.each( record => {
                if ( !record.get( "enabled" ) ) return;

                roles ??= [];

                roles.push( record.id );
            } );

            return roles;
        },

        // protected
        _enabledColReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setCell( {
                "xtype": "widgetcell",
                "widget": {
                    "xtype": "container",
                    "layout": { "type": "hbox", "pack": "center", "align": "top" },
                    "items": [
                        {
                            "xtype": "togglefield",
                            "bind": {
                                "value": "{record.enabled}",
                                "disabled": "{record.readonly}",
                            },
                            "listeners": { "change": this._setRoleEnabled.bind( this ) },
                        },
                    ],
                },
            } );
        },

        _searchRoles ( e ) {
            const value = e.detail.newValue.trim();

            if ( value !== "" ) {
                this.store.addFilter( {
                    "property": "name",
                    "operator": "like",
                    "value": value,
                } );
            }
            else {
                this.store.removeFilter( "name" );
            }
        },

        async _setRoleEnabled ( button, enabled ) {

            // user is phantom
            if ( !this.userId ) return;

            const record = button.lookupViewModel().get( "record" );

            // not changed
            if ( enabled === record.get( "enabled" ) ) return;

            button.disable();

            var res;

            if ( enabled ) {
                res = await this.$api.call( "acl/add-acl-user-roles", this.aclId, this.userId, [ record.id ] );
            }
            else {
                res = await this.$api.call( "acl/delete-acl-user-roles", this.aclId, this.userId, [ record.id ] );
            }

            if ( res.ok ) {
                this.$toast( enabled
                    ? l10n( "Role enabled" )
                    : l10n( "Role disabled" ) );

                this.$emit( "update", this.getEnabledRoles() );
            }
            else {
                record.set( "enabled", !enabled );
                button.setValue( !enabled );

                this.$toast( res );
            }

            button.enable();
        },
    },
};
</script>
