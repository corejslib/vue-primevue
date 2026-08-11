<template>
    <ext-button ref="button" :hidden="emailConfirmed" :text="l10n(`Confirm email`)" ui="action" @tap="_confirmEmail"/>
</template>

<script>
import Events from "#core/events";

export default {
    "computed": {
        emailConfirmed () {
            return this.$app.user.isEmailConfirmed;
        },
    },

    mounted () {
        if ( !this._events ) {
            this._events = new Events().link( this.$api );

            this._events.on( "session/email/confirm", () => this.$app.user.setEmailConfirmed( true ) );
        }
    },

    unmounted () {
        this._events.unlinkAll();

        this._events = null;
    },

    "methods": {
        async _confirmEmail () {
            const button = this.$refs.button.ext;

            button.disable();

            const res = await this.$api.call( "session/send-confirmation-email" );

            button.enable();

            if ( res.ok ) {
                if ( res.data.email_confirmed ) {
                    this.$app.user.setEmailConfirmed( true );

                    this.$toast( l10n( "Email address confirmed" ) );
                }
                else {
                    this.$toast( l10n( "Confirmation email sent" ) );
                }
            }
            else {
                this.$toast( res );
            }
        },
    },
};
</script>
