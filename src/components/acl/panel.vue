<template>
    <CardsPanel ref="cards" :store="store" viewModel="true" @refresh="refresh">
        <template #docked>
            <ext-toolbar docked="top">
                <ext-searchfield :placeholder="l10n(`Search users`)" width="200" @change="_searchUsers"/>
                <RolesButton :aclId="aclId" @change="_onRolesFilterChange"/>
                <ext-spacer/>
                <ext-button bind='{"hidden":"{!permissions.create}"}' iconCls="fa-solid fa-plus" :text="l10n(`Add user`)" @tap="_showAddUserDialog"/>
                <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
            </ext-toolbar>
        </template>

        <template #dataPanel>
            <ext-grid ref="grid" columnMenu="false" columnResize="false" multicolumnSort="true" plugins='["gridviewoptions", "autopaging"]' viewModel="true" @childdoubletap="_onChildDoubleTap" @ready="_ready">
                <ext-avatarcolumn/>

                <ext-column cell='{"style":"vertical-align:top"}' dataIndex="email" flex="1" :text="l10n(`Email`)"/>

                <ext-column cell='{"encodeHtml":false}' dataIndex="roles" flex="1" sortable="false" :text="l10n(`Roles`)" @ready="_rolesColReady"/>

                <ext-column sorter='{"property":"enabled"}' :text="l10n(`Access enabled`)" width="160" @ready="_enabledColReady"/>

                <ext-column width="80" @ready="_actionColReady"/>
            </ext-grid>
        </template>
    </CardsPanel>
</template>

<script>
import RolesButton from "#src/components/acl/roles.button";
import RolesDialog from "#src/components/acl/roles.dialog";
import CardsPanel from "#src/components/cards.panel";
import AddUserDialog from "./add-user.dialog";
import PermissionModel from "./models/permission";
import UserModel from "./models/user";

export default {
    "components": { CardsPanel, RolesButton },

    "props": {
        "aclId": {
            "type": Number,
            "required": true,
        },
    },

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "model": UserModel,
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

        // public
        async refresh () {
            var res;

            // load permissions
            this.$refs.cards.mask();

            // load permissions
            res = await this.$api.call( "acl/get-acl-user-permissions", this.aclId );

            if ( res.ok ) {
                this.$refs.cards.ext.getViewModel().get( "permissions" ).set( "permissions", this.$app.user.permissions.addPermissions( res.data ) );
            }
            else {
                this.$refs.cards.ext.getViewModel().get( "permissions" ).set( "permissions", this.$app.user.permissions );
            }

            // load roles
            if ( !this._rolesLoaded ) {
                this.$refs.cards.mask();

                res = await this.$api.call( "acl/get-acl-roles", this.aclId );

                if ( res.ok ) {
                    this._rolesLoaded = true;

                    this.roles = {};

                    for ( const role of res.data ) {
                        this.roles[ role.id ] = role.name;
                    }
                }
            }

            this.$refs.cards.unmask();

            // error
            if ( res && !res.ok ) {
                this.$refs.cards.setResult( res );

                this.$toast( res );

                return;
            }

            // refresh users
            this.store.loadPage( 1 );
        },

        // protected
        _ready ( e ) {
            const cmp = e.detail.cmp;

            const permissions = new PermissionModel( { "permissions": this.$app.user.permissions } );

            cmp.setItemConfig( {
                "viewModel": {
                    "formulas": {
                        "canUpdate": {
                            "bind": {
                                "user": "{record}",
                            },
                            "get": data => data.user.get( "editable" ) && permissions.get( "update" ),
                        },

                        "canDelete": {
                            "bind": {
                                "user": "{record}",
                            },
                            "get": data => data.user.get( "editable" ) && permissions.get( "delete" ),
                        },
                    },
                },
            } );

            this.$refs.cards.ext.getViewModel().set( "permissions", permissions );
            this.$refs.grid.ext.getViewModel().set( "permissions", permissions );

            cmp.setStore( this.store );
        },

        _rolesColReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setRenderer( ( value, record ) => {
                if ( !value ) {
                    return "&mdash;";
                }
                else {
                    return value.map( role => this.roles[ role ] ).join( ", " );
                }
            } );
        },

        _enabledColReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setCell( {
                "xtype": "widgetcell",
                "widget": {
                    "xtype": "container",
                    "layout": { "type": "hbox", "pack": "center" },
                    "items": [
                        {
                            "xtype": "togglefield",
                            "bind": {
                                "value": "{record.enabled}",
                                "disabled": "{!canUpdate}",
                            },
                            "listeners": { "change": this._setAclUserEnabled.bind( this ) },
                        },
                    ],
                },
            } );
        },

        _actionColReady ( e ) {
            var cmp = e.detail.cmp;

            cmp.setCell( {
                "xtype": "widgetcell",
                "widget": {
                    "xtype": "container",
                    "layout": { "type": "hbox", "pack": "end", "align": "center" },
                    "items": [
                        {
                            "xtype": "button",
                            "iconCls": "fa-solid fa-unlock-alt",
                            "tooltip": l10n( "Edit user roles" ),
                            "handler": this._showUserRolesDialog.bind( this ),
                            "bind": {
                                "disabled": "{!permissions.read}",
                            },
                        },
                        {
                            "xtype": "button",
                            "iconCls": "fa-regular fa-trash-can",
                            "tooltip": l10n( "Delete user" ),
                            "handler": this._deleteAclUser.bind( this ),
                            "ui": "decline",
                            "bind": {
                                "disabled": "{!canDelete}",
                            },
                        },
                    ],
                },
            } );
        },

        _searchUsers ( e ) {
            var val = e.detail.newValue.trim();

            if ( val !== "" ) {
                this.store.addFilter( {
                    "property": "email",
                    "operator": "like",
                    "value": val,
                } );
            }
            else {
                this.store.removeFilter( "email" );
            }
        },

        async _setAclUserEnabled ( button, enabled ) {
            const record = button.up( "gridrow" ).getRecord();

            if ( enabled === record.get( "enabled" ) ) return;

            button.disable();

            const res = await this.$api.call( "acl/set-acl-user-enabled", this.aclId, record.id, enabled );

            if ( !res.ok ) {
                record.set( "enabled", !enabled );
                button.setValue( !enabled );

                this.$toast( res );
            }
            else {
                record.commit();

                this.$toast( enabled
                    ? l10n( "Access enabled" )
                    : l10n( "Access disabled" ) );
            }

            button.enable();
        },

        async _deleteAclUser ( button ) {
            const record = button.up( "gridrow" ).getRecord();

            if ( !( await this.$utils.confirm( l10n( "Are you sure you want to delete user?" ) ) ) ) return;

            button.disable();

            var res = await this.$api.call( "acl/delete-acl-user", this.aclId, record.id );

            button.enable();

            if ( res.ok ) {
                this.$toast( l10n( "User deleted" ) );

                this.store.remove( record );
            }
            else {
                this.$toast( res );
            }
        },

        async _showUserRolesDialog ( button ) {
            const record = button.up( "gridrow" ).getRecord();

            return this._openUserRolesDialog( record );
        },

        async _showAddUserDialog () {
            const cmp = await this.$mount( AddUserDialog, {
                "props": {
                    "aclId": this.aclId,
                    "onAdd": () => this.refresh(),
                },
            } );

            cmp.ext.show();
        },

        _onRolesFilterChange ( roles ) {
            if ( roles ) {
                this.store.addFilter( {
                    "property": "roles",
                    "operator": "in",
                    "value": roles,
                } );
            }
            else {
                this.store.removeFilter( "roles" );
            }
        },

        _onChildDoubleTap ( e ) {
            if ( !this.$refs.cards.ext.getViewModel().get( "permissions" ).get( "read" ) ) return;

            return this._openUserRolesDialog( e.detail.location.record );
        },

        async _openUserRolesDialog ( record ) {
            const cmp = await this.$mount( RolesDialog, {
                "props": {
                    "aclId": this.aclId,
                    "userRecord": record,
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
