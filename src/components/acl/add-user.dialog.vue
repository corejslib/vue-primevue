<template>
    <ext-dialog height="90%" layout="vbox" :title="l10n(`Adding a user`)" width="600" @ready="_ready">
        <ext-comboboxfield ref="addUserCombo" displayField="email" forceSelection="true" :label="l10n(`Select user`)" labelAlign="left" labelWidth="150" minChars="1" primaryFilter='{"operator":"like","property":"email"}' required="true" :store="store" triggerAction="query" valueField="id" @ready="_comboReady"/>

        <ext-togglefield ref="enabledField" :label="l10n(`Access enabled`)" labelAlign="left" labelWidth="150" value="true"/>

        <RolesPanel ref="rolesPanel" :aclId="aclId" flex="1"/>

        <ext-toolbar docked="bottom">
            <ext-spacer/>
            <ext-button :text="l10n(`Add user`)" ui="action" @tap="_addUser"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
import RolesPanel from "#src/components/acl/roles.panel";

export default {
    "components": { RolesPanel },

    "props": {
        "aclId": {
            "type": Number,
            "required": true,
        },
    },

    "emits": [ "add" ],

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "autoLoad": false,
            "pageSize": null,
            "proxy": {
                "api": { "read": "acl/suggest-acl-users" },
            },
            "filters": [
                {
                    "property": "acl_id",
                    "operator": "=",
                    "value": this.aclId,
                },
            ],
        } );
    },

    "methods": {

        // protected
        _ready ( e ) {
            this.ext = e.detail.cmp;

            this.ext.setKeyMap( {
                "ENTER": this._addUser.bind( this ),
            } );
        },

        _comboReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setItemTpl( `
<div style="display:flex;align-items:center">
    <img src="{avatar_url}" width="32" height="32" style="border: 1px solid white; border-radius: 50%"/>
    &nbsp;
    {email}
</div>
` );
        },

        async _addUser () {
            if ( !this.$refs.addUserCombo.ext.validate() ) return;

            this.ext.mask();

            const res = await this.$api.call( "acl/add-acl-user", this.aclId, this.$refs.addUserCombo.ext.getValue(), {
                "enabled": this.$refs.enabledField.ext.getValue(),
                "roles": this.$refs.rolesPanel.getEnabledRoles(),
            } );

            this.ext.unmask();

            if ( res.ok ) {
                this.$toast( l10n( "User added" ) );

                this.$emit( "add" );

                this.ext.close();
            }
            else {
                this.$toast( res );
            }
        },
    },
};
</script>
