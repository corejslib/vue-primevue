<template>
    <ext-panel>
        <ext-button :hidden="hidden" iconCls="fa-solid fa-plus" :text="l10n(`Create bot`)" :ui="ui" @tap="_showCreateotDialog"/>
    </ext-panel>
</template>

<script>
import telegramComponents from "#src/components/telegram/components";
import CreateBotDialog from "./create-bot.dialog";

export default {
    "props": {
        "ui": {
            "type": String,
            "default": null,
        },
    },

    "emits": [ "botCreate" ],

    data () {
        return {
            "hidden": !telegramComponents.hasPublicComponents || !this.$app.user.permissions.has( "telegram/bot:create" ),
        };
    },

    "methods": {
        async _showCreateotDialog () {
            const cmp = await this.$mount( CreateBotDialog, {
                "props": {
                    "onBotCreate": () => this.$emit( "botCreate" ),
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
