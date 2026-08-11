<template>
    <ext-dialog height="90%" layout="vbox" scrollable="true" :title="l10n(`User creation`)" width="600" @ready="_ready">
        <ext-fieldpanel ref="form">
            <ext-emailfield :label="l10n(`Email`)" labelAlign="left" labelWidth="150" name="email" :placeholder="l10n(`Enter email`)" required="true" validators="email"/>

            <ext-passwordfield :label="l10n(`Password`)" labelAlign="left" labelWidth="150" name="password" :placeholder="l10n(`Enter password`)" required="true" revealable="true"/>

            <ext-passwordfield :label="l10n(`Confirm password`)" labelAlign="left" labelWidth="150" name="confirmedPassword" :placeholder="l10n(`Confirm password`)" required="true" revealable="true"/>

            <ext-container layout="center">
                <ext-button :text="l10n(`Generate random password`)" @tap="_generateRandomPassword"/>
            </ext-container>

            <ext-togglefield :label="l10n(`Access enabled`)" labelAlign="left" labelWidth="150" name="enabled" value="true"/>
        </ext-fieldpanel>

        <RolesPanel ref="rolesPanel" :aclId="aclId" flex="1"/>

        <ext-toolbar docked="bottom">
            <ext-spacer/>
            <ext-button :text="l10n(`Create user`)" ui="action" @tap="_createUser"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
import constants from "#core/app/constants";
import Passwords from "#core/crypto/passwords";
import RolesPanel from "#src/components/acl/roles.panel";

export default {
    "components": { RolesPanel },

    "props": {},

    "emits": [ "created" ],

    data () {
        return {
            "aclId": constants.mainAclId,
        };
    },

    "methods": {

        // protected
        async _ready ( e ) {
            this.ext = e.detail.cmp;

            this.ext.setKeyMap( {
                "ENTER": this._createUser.bind( this ),
            } );

            this.$refs.form.ext.getFields( "password" ).setValidators( {
                "type": "password-strength",
                "allowWeakPasswords": this.$app.settings.allowWeakPasswords,
            } );
        },

        _generateRandomPassword () {
            const password = Passwords.default.generateRandomPassword().password;

            this.$utils.copyToClipboard( password );

            this.$toast( l10n( "Password copied to the clipboard" ) );

            this.$refs.form.ext.getFields( "password" ).setValue( password );
            this.$refs.form.ext.getFields( "confirmedPassword" ).setValue( password );
        },

        async _createUser () {
            const form = this.$refs.form.ext;

            if ( !form.validate() ) return;

            const values = form.getValues();

            if ( values.password !== values.confirmedPassword ) {
                form.getFields( "confirmedPassword" ).setError( l10n( "Passwords do not match" ) );

                return;
            }

            const email = values.email;
            delete values.email;

            delete values.confirmedPassword;

            values.roles = this.$refs.rolesPanel.getEnabledRoles();

            this.ext.mask();

            const res = await this.$api.call( "administration/users/create-user", email, values );

            this.ext.unmask();

            if ( res.ok ) {
                this.$toast( l10n( "User created" ) );

                this.$emit( "created" );

                this.ext.close();
            }
            else {
                this.$toast( res );
            }
        },
    },
};
</script>
