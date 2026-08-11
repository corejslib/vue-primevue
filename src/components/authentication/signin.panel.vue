<template>
    <ext-panel layout="vbox" scrollable="true" @ready="_ready">
        <ext-toolbar docked="top">
            <ext-spacer/>
            <ext-container :html="l10n(`Sign in`)"/>
            <ext-spacer/>
        </ext-toolbar>

        <!-- oauth -->
        <ext-container layout="center">
            <OauthContainer margin="0 0 10 0" width="95%" @tap="_oauthTap"/>
        </ext-container>

        <ext-fieldpanel ref="form" defaults='{"margin":"0 0 0 0"}'>
            <ext-emailfield :label="l10n(`Email address`)" name="email" :placeholder="l10n(`Enter your email address`)" required="true" validators="email"/>

            <ext-passwordfield :label="l10n(`Password`)" name="password" :placeholder="l10n(`Enter password`)" required="true" revealable="true"/>
        </ext-fieldpanel>

        <!-- password recovery -->
        <ext-container :hidden="!passwordRecoveryEnabled" layout="center" margin="10 0 0 0">
            <ext-button :text="l10n(`Forgot password?`)" @tap="showPasswordRecovery"/>
        </ext-container>

        <!-- sign up -->
        <ext-container :hidden="!signupEnabled" layout="center" margin="10 0 0 0">
            <ext-button :text="l10n(`Do not have account? Sign up`)" @tap="showSignup"/>
        </ext-container>

        <ext-toolbar docked="bottom">
            <ext-spacer/>
            <ext-button :text="l10n(`Sign in`)" ui="action" @tap="_submit"/>
        </ext-toolbar>
    </ext-panel>
</template>

<script>
import OauthContainer from "#src/components/oauth.container";

export default {
    "components": { OauthContainer },

    "props": {
        "signupEnabled": {
            "type": Boolean,
            "default": false,
        },
        "passwordRecoveryEnabled": {
            "type": Boolean,
            "default": false,
        },
    },

    "emits": [ "recover", "signup" ],

    "methods": {
        _ready ( e ) {
            const cmp = e.detail.cmp;

            cmp.setKeyMap( { "ENTER": this._submit.bind( this ) } );
        },

        showPasswordRecovery () {
            this.$emit( "recover" );
        },

        showSignup () {
            this.$emit( "signup" );
        },

        _submit () {
            const form = this.$refs.form.ext;

            if ( !form.validate() ) return;

            const values = form.getValues();

            this._signIn( values );
        },

        _oauthTap ( oauthProvider ) {
            this._signIn( { oauthProvider } );
        },

        async _signIn ( options ) {
            this.$app.mask();

            const res = await this.$app.signIn( options );

            if ( !res.ok ) {
                this.$app.unmask();

                this.$toast( res );
            }
        },
    },
};
</script>
