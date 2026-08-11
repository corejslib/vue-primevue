<template>
    <ext-panel height="500" layout='{"align":"end","type":"vbox"}'>
        <LocaleButton/>

        <ext-panel flex="1" layout='{"animation":"slide","type":"card"}' :shadow="shadow" width="300" @ready="ready">
            <ext-titlebar docked="top" :title="title" titleAlign="left"/>

            <SigninPanel :passwordRecoveryEnabled="passwordRecoveryEnabled" :signupEnabled="signupEnabled" @recover="showPasswordRecovery" @signup="showSignup"/>

            <PasswordRecoveryPanel @signin="showSignin"/>

            <SignupPanel @signin="showSignin"/>
        </ext-panel>
    </ext-panel>
</template>

<script>
import LocaleButton from "#src/components/locale.button";
import PasswordRecoveryPanel from "./password-recovery.panel";
import SigninPanel from "./signin.panel";
import SignupPanel from "./signup.panel";

export default {
    "components": { LocaleButton, SigninPanel, PasswordRecoveryPanel, SignupPanel },

    "props": {
        "passwordRecoveryEnabled": {
            "type": Boolean,
            "default": true,
        },
        "closable": {
            "type": Boolean,
            "default": false,
        },
        "shadow": {
            "type": Boolean,
            "default": true,
        },
    },

    "emits": [ "close" ],

    "computed": {
        title () {
            return this.$app.settings.title;
        },

        signupEnabled () {
            return this.$app.settings.signupEnabled;
        },
    },

    "methods": {
        ready ( e ) {
            this.ext = e.detail.cmp;

            // TODO fix for forms switch, remove
            this.ext.setActiveItem( 0 );

            if ( this.closable ) {
                this.ext.setTools( [
                    {
                        "type": "close",
                        "handler": this.close.bind( this ),
                    },
                ] );
            }
        },

        close () {
            this.$emit( "close" );
        },

        showSignin () {
            this.ext.setActiveItem( 0 );
        },

        showPasswordRecovery () {
            this.ext.setActiveItem( 1 );
        },

        showSignup () {
            this.ext.setActiveItem( 2 );
        },
    },
};
</script>
