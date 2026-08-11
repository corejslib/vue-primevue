<template>
    <ext-container defaults='{"margin":"5 0 0 0","ui":"action"}' layout='{"pack":"center","type":"vbox"}'>
        <ext-button :hidden="!signinGoogleEnabled" iconCls="fa-brands fa-google" :text="l10n(`Sign in with`) + ` Google`" @tap="_oauthGoogle"/>

        <ext-button :hidden="!signinFacebookEnabled" iconCls="fa-brands fa-square-facebook" :text="l10n(`Sign in with`) + ` Facebook`" @tap="_oauthFacebook"/>

        <ext-button :hidden="!signinGitHubEnabled" iconCls="fa-brands fa-github" :text="l10n(`Sign in with`) + ` GitHub`" @tap="_oauthGitHub"/>
    </ext-container>
</template>

<script>
export default {
    "emits": [ "tap" ],

    "computed": {
        signinGoogleEnabled () {
            return !!this.$app.settings.oauthGoogleClientId;
        },

        signinFacebookEnabled () {
            return !!this.$app.settings.oauthFacebookClientId;
        },

        signinGitHubEnabled () {
            return !!this.$app.settings.oauthGithubClientId;
        },
    },

    "methods": {
        _oauthGoogle () {
            this._oauth( "google" );
        },

        _oauthFacebook () {
            this._oauth( "facebook" );
        },

        _oauthGitHub () {
            this._oauth( "github" );
        },

        async _oauth ( oauthProvider ) {
            this.$emit( "tap", oauthProvider );
        },
    },
};
</script>
