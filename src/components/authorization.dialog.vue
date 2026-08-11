<template>
    <ext-dialog height="350" :title="l10n(`Authorization`)" width="300" @ready="_ready">
        <ext-container :html="l10n(`Authorization is required to perform this operation. Please, authorize and then repeat action again.`)"/>

        <!-- oauth -->
        <ext-container layout="center">
            <OauthContainer margin="0 0 10 0" width="95%" @tap="_oauthTap"/>
        </ext-container>

        <ext-fieldpanel ref="form">
            <ext-passwordfield :label="l10n(`Password`)" name="password" :placeholder="l10n(`Enter password`)" required="true" revealable="true"/>
        </ext-fieldpanel>

        <ext-toolbar docked="bottom" layout='{"pack":"end","type":"hbox"}'>
            <ext-button :text="l10n(`Authorize`)" ui="action" @tap="_submit"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
import OauthContainer from "#src/components/oauth.container";

export default {
    "components": { OauthContainer },

    "props": {
        "authorize": {
            "type": Function,
            "default": null,
        },
        "emailHint": {
            "type": Boolean,
            "default": true,
        },
    },

    "methods": {
        _ready ( e ) {
            this.ext = e.detail.cmp;

            this.ext.setKeyMap( { "ENTER": this._submit.bind( this ) } );

            this.ext.on( "destroy", () => {
                if ( this._resolve ) this._resolve( false );
            } );
        },

        async show () {
            this.ext.show();

            return new Promise( resolve => {
                this._resolve = resolve;
            } );
        },

        _submit () {
            const form = this.$refs.form.ext;

            if ( !form.validate() ) return;

            const values = form.getValues();

            this._authorize( { "password": values.password } );
        },

        _oauthTap ( oauthProvider ) {
            this._authorize( { oauthProvider } );
        },

        async _authorize ( options ) {
            this.ext.mask();

            var res;

            if ( this.authorize ) {
                res = await this.$app.authorize( options, {
                    "emailHint": this.emailHint,
                    "doAuthorization": false,
                } );

                if ( res.ok ) {
                    res = await this.authorize( res.data );
                }
            }
            else {
                res = await this.$app.authorize( options, {
                    "emailHint": this.emailHint,
                } );
            }

            this.ext.unmask();

            if ( res.ok ) {
                this.$toast( l10n( "Authorized" ) );

                this._resolve( true );

                this._resolve = null;

                this.ext.close();
            }
            else {
                this.$toast( res );
            }
        },
    },
};
</script>
