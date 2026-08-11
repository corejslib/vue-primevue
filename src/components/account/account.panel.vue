<template>
    <CardsPanel ref="cardsPanel" @refresh="refresh">
        <template #dataPanel>
            <ext-container ref="dataCard" layout="vbox" padding="0 10 0 10" scrollable="true" viewModel="true" @ready="_ready">
                <!-- locale -->
                <ext-fieldcontainer container='{"defaults":null}' :hidden="localeHidden" :label="l10n(`Locale`)" labelAlign="left" labelWidth="200" layout='{"align":"center","type":"hbox"}'>
                    <LocaleButton/>
                </ext-fieldcontainer>

                <!-- password -->
                <ext-fieldcontainer container='{"defaults":null}' :label="l10n(`Password`)" labelAlign="left" labelWidth="200" layout='{"align":"center","type":"hbox"}'>
                    <ext-button :text="l10n(`Change password`)" @tap="_changePassword"/>
                </ext-fieldcontainer>

                <!-- email  -->
                <ext-fieldcontainer container='{"defaults":null}' :label="l10n(`Email address`)" labelAlign="left" labelWidth="200" layout='{"align":"center","type":"hbox"}'>
                    <ext-container layout='{"align":"start","type":"vbox"}'>
                        <ext-displayfield :value="$app.user.email" width="200"/>

                        <ext-container layout="hbox">
                            <!-- change email address -->
                            <ext-button :text="l10n(`Change email address`)" @tap="_changeEmail"/>

                            <!-- confitm email -->
                            <ConfirmEmailButton/>
                        </ext-container>
                    </ext-container>
                </ext-fieldcontainer>

                <!-- sessions -->
                <UserSessionsPanel flex="1"/>
            </ext-container>
        </template>
    </CardsPanel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import ChangeEmailDialog from "#src/components/change-email.dialog";
import ChangePasswordDialog from "#src/components/change-password.dialog";
import LocaleButton from "#src/components/locale.button";
import UserSessionsPanel from "#src/components/user-sessions/panel";
import ConfirmEmailButton from "./confirm-email.button";
import AccountModel from "./models/account";

export default {
    "components": { CardsPanel, LocaleButton, UserSessionsPanel, ConfirmEmailButton },

    "computed": {
        localeHidden () {
            return !this.$app.locale.canChangeLocale;
        },
    },

    "methods": {
        _ready ( e ) {
            this.ext = e.detail.cmp;
        },

        async refresh () {
            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "account/get-account" );

            this.$refs.cardsPanel.setResult( res );

            if ( !res.ok ) {
                this.$toast( res );
            }
            else {
                const record = new AccountModel( res.data );

                this.ext.getViewModel().set( "record", record );

                this.$app.user.setEmailConfirmed( record.get( "email_confirmed" ) );
            }
        },

        // email
        async _changeEmail () {
            const cmp = await this.$mount( ChangeEmailDialog );

            cmp.ext.show();
        },

        // password
        async _changePassword () {
            const cmp = await this.$mount( ChangePasswordDialog );

            cmp.ext.show();
        },
    },
};
</script>
