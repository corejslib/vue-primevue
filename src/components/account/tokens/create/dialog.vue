<template>
    <ext-dialog height="400" layout="vbox" :title="l10n(`Create token`)" width="350" @ready="ready">
        <ext-fieldpanel ref="form">
            <ext-textfield ref="name" :label="l10n(`Token name`)" name="name" :placeholder="l10n(`Enter new token name`)" required="true"/>
        </ext-fieldpanel>

        <ext-container ref="done" defaults='{"labelAlign":"top"}' hidden="true">
            <ext-spacer height="10"/>
            <ext-textareafield ref="token" height="90" :label="l10n(`Your token:`)" readOnly="true" textAlign="center"/>
            <ext-container>
                <div>{{ l10n(`Please, copy token to the clipboard and store it to the safe place. After this dialog window will be closed we were unable to show you this token again.`) }}</div>
            </ext-container>
            <ext-spacer height="5"/>
            <ext-container layout="center">
                <ext-button iconCls="fa-regular fa-copy" :text="l10n(`Copy token to the clipboard`)" ui="action" @tap="copyToClipboard"/>
            </ext-container>
        </ext-container>

        <ext-toolbar docked="bottom">
            <ext-spacer/>
            <ext-button ref="generateTokenButton" :text="l10n(`Create token`)" ui="action" @tap="generateToken"/>
            <ext-button ref="closeButton" hidden="true" :text="l10n(`Done`)" ui="action" @tap="close"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
export default {
    "emits": [ "created" ],

    "methods": {
        async ready ( e ) {
            this.ext = e.detail.cmp;

            this.ext.setKeyMap( {
                "ENTER": () => {
                    if ( !this.$refs.generateTokenButton.ext.getHidden() ) {
                        this.generateToken();
                    }
                    else {
                        this.copyToClipboard();
                    }
                },
            } );
        },

        close () {
            this.ext.close();
        },

        async generateToken () {
            var form = this.$refs.form.ext;

            if ( !form.validate() ) return;

            var vals = form.getValues();

            this.ext.mask();

            const res = await this.$api.call( "account/tokens/create", vals.name );

            this.ext.unmask();

            if ( res.ok ) {
                this.$refs.token.ext.setValue( res.data.token );

                this.$refs.name.ext.setReadOnly( true );
                this.$refs.done.ext.setHidden( false );

                this.$refs.generateTokenButton.ext.setHidden( true );

                this.$toast( l10n( "Token created" ) );

                this.$emit( "created" );
            }
            else {
                this.$toast( res );
            }
        },

        copyToClipboard () {
            this.$utils.copyToClipboard( this.$refs.token.ext.getValue() );

            this.$refs.closeButton.ext.setHidden( false );

            this.$toast( l10n( "Token copied to the clipboard" ) );
        },
    },
};
</script>
