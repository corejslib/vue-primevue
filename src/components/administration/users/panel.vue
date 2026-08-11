<template>
    <CardsPanel ref="cards" :store="store" @refresh="refresh">
        <template #docked>
            <ext-toolbar docked="top">
                <ext-searchfield :placeholder="l10n(`Search users`)" width="200" @change="search"/>
                <RolesButton :aclId="aclId" @change="_onRolesFilterChange"/>
                <ext-spacer/>
                <ext-button :disabled="!canCreateUser" iconCls="fa-solid fa-plus" padding="0 0 0 5" :text="l10n(`Create user`)" @tap="showCreateUserDialog"/>
                <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
            </ext-toolbar>
        </template>

        <template #dataPanel>
            <ext-grid layout="fit" multicolumnSort="true" plugins='["gridviewoptions", "autopaging"]' @childdoubletap="_onChildDoubleTap" @ready="_gridReady">
                <ext-avatarcolumn/>

                <ext-column dataIndex="email" flex="1" :text="l10n(`Email`)" @ready="_emailColReady"/>

                <ext-column cell='{"encodeHtml":false}' dataIndex="roles" flex="1" sortable="false" :text="l10n(`Roles`)" @ready="_rolesColReady"/>

                <ext-column cell='{"encodeHtml":false}' dataIndex="last_activity_text" :hidden="lastActivityColumnHidden" sorter='{"property":"last_activity"}' :text="l10n(`Last activity`)" width="150"/>

                <ext-column dataIndex="created" formatter="date()" :hidden="createdColumnHidden" :text="l10n(`Creation date`)" width="150"/>

                <ext-column sorter='{"property":"enabled"}' :text="l10n(`Access enabled`)" width="160" @ready="_enabledColReady"/>

                <ext-column width="80" @ready="_actionColReady"/>
            </ext-grid>
        </template>
    </CardsPanel>
</template>

<script>
import constants from "#core/app/constants";
import RolesButton from "#src/components/acl/roles.button";
import UserRolesDialog from "#src/components/acl/roles.dialog";
import CardsPanel from "#src/components/cards.panel";
import ChangePasswordDialog from "./change-password.dialog";
import CreateUserDialog from "./create-user.dialog";
import UserModel from "./models/user";
import UserSessionsDialog from "./user-sessions.dialog";

export default {
    "components": { CardsPanel, RolesButton },

    "props": {
        "lastActivityColumnHidden": {
            "type": Boolean,
            "default": false,
        },
        "createdColumnHidden": {
            "type": Boolean,
            "default": false,
        },
    },

    data () {
        return {
            "aclId": constants.mainAclId,

            "canCreateUser": this.$app.user.permissions.has( "administration:create" ),
            "canUpdateUser": this.$app.user.permissions.has( "administration:update" ),
            "canDeleteUser": this.$app.user.permissions.has( "administration:delete" ),
            "canUpdateUserRoles": this.$app.user.permissions.hasAll( [ "administration:update", "acl:update" ] ),
        };
    },

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "model": UserModel,
            "autoLoad": false,
            "pageSize": 50,
        } );
    },

    "methods": {

        // public
        async refresh () {
            var res;

            // load roles
            if ( !this._rolesLoaded ) {
                this.$refs.cards.mask();

                res = await this.$api.call( "acl/get-acl-roles", constants.mainAclId );

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

            this.$refs.cards.mask();

            this.store.loadPage( 1 );
        },

        // protected
        _gridReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setItemConfig( {
                "viewModel": {
                    "formulas": {
                        "canUpdateEnabled": {
                            "bind": {
                                "user": "{record}",
                            },
                            "get": data => data.user.id !== this.$app.user.id && this.canUpdateUser,
                        },

                        "canDeleteUser": {
                            "bind": {
                                "user": "{record}",
                            },
                            "get": data => data.user.id !== this.$app.user.id && this.canDeleteUser,
                        },
                    },
                },
            } );

            cmp.setStore( this.store );
        },

        _emailColReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setCell( { "encodeHtml": false } );
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
                                "disabled": "{!canUpdateEnabled}",
                            },
                            "listeners": { "change": this.setUserEnabled.bind( this ) },
                        },
                    ],
                },
            } );
        },

        _actionColReady ( e ) {
            const cmp = e.detail.cmp;

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
                            "handler": this.showUserRolesDialog.bind( this ),
                            "disabled": !this.canUpdateUserRoles,
                        },
                        {
                            "xtype": "button",
                            "iconCls": "fa-solid fa-ellipsis-v",
                            "tooltip": l10n( "Actions" ),
                            "arrow": false,
                            "menu": {
                                "defaults": {
                                    "xtype": "menuitem",
                                },
                                "items": [
                                    {
                                        "iconCls": "fa-regular fa-copy",
                                        "text": l10n( "Copy email" ),
                                        "handler": this._copyEmail.bind( this ),
                                    },
                                    {
                                        "text": l10n( "View user sessions" ),
                                        "handler": this._showUserSessionsDialog.bind( this ),
                                    },
                                    {
                                        "text": l10n( "Change password" ),
                                        "handler": this._showChangePasswordDialog.bind( this ),
                                        "disabled": !this.canUpdateUser,
                                    },
                                    {
                                        "separator": true,
                                        "iconCls": "fa-regular fa-trash-can",
                                        "text": l10n( "Delete user" ),
                                        "handler": this.deleteUser.bind( this ),
                                        "bind": {
                                            "disabled": "{!canDeleteUser}",
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            } );
        },

        async setUserEnabled ( button, enabled ) {
            const gridrow = button.up( "gridrow" ),
                record = gridrow.getRecord(),
                curVal = record.get( "enabled" );

            if ( enabled === curVal ) return;

            button.disable();

            const res = await this.$api.call( "administration/users/set-enabled", record.get( "id" ), enabled );

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

        async deleteUser ( button ) {
            const gridrow = button.up( "gridrow" ),
                record = gridrow.getRecord();

            if ( !( await this.$utils.confirm( l10n( "Are you sure you want to delete user?" ) ) ) ) return;

            button.disable();

            var res = await this.$api.call( "administration/users/delete", record.getId() );

            button.enable();

            if ( res.ok ) {
                this.$toast( l10n( "User deleted" ) );

                this.store.remove( record );
            }
            else {
                this.$toast( res );
            }
        },

        search ( e ) {
            var val = e.detail.newValue.trim();

            if ( val !== "" ) {
                this.store.addFilter( {
                    "property": "search",
                    "operator": "like",
                    "value": val,
                } );
            }
            else {
                this.store.removeFilter( "search" );
            }
        },

        async showCreateUserDialog () {
            const cmp = await this.$mount( CreateUserDialog, {
                "props": {
                    "onCreated": () => this.refresh(),
                },
            } );

            cmp.ext.show();
        },

        async showUserRolesDialog ( button ) {
            const gridrow = button.up( "gridrow" ),
                record = gridrow.getRecord();

            return this._openUserRolesDialog( record );
        },

        async _showChangePasswordDialog ( button ) {
            const record = button.lookupViewModel().get( "record" );

            const cmp = await this.$mount( ChangePasswordDialog, {
                "props": {
                    "userRecord": record,
                },
            } );

            cmp.ext.show();
        },

        async _showUserSessionsDialog ( button ) {
            const record = button.lookupViewModel().get( "record" );

            const cmp = await this.$mount( UserSessionsDialog, {
                "props": {
                    "userRecord": record,
                },
            } );

            cmp.ext.show();
        },

        _copyEmail ( button ) {
            const record = button.lookupViewModel().get( "record" );

            this.$utils.copyToClipboard( record.get( "email" ) );

            this.$toast( l10n( "User email copied" ) );
        },

        _onChildDoubleTap ( e ) {
            return this._openUserRolesDialog( e.detail.location.record );
        },

        async _openUserRolesDialog ( record ) {
            const cmp = await this.$mount( UserRolesDialog, {
                "props": {
                    "aclId": constants.mainAclId,
                    "userRecord": record,
                },
            } );

            cmp.ext.show();
        },

        // roles filter
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
    },
};
</script>
