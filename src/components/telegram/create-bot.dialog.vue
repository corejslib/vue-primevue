<template>
    <ext-dialog height="500" layout="fit" :title="l10n(`Create bot`)" width="500">
        <CardsPanel ref="cardsPanel" @refresh="refresh">
            <template #dataPanel>
                <ext-panel ref="dataPanel" layout='{"animation":"slide","type":"card"}' @ready="_ready">
                    <!-- api token panel -->
                    <ext-fieldpanel ref="apiTokenPanel" layout="vbox">
                        <ext-textfield :label="l10n(`Enter your Telegram bot API token`)" name="api_token" required="true"/>

                        <ext-comboboxfield displayTpl="{name}" editable="false" forceSelection="true" :label="l10n(`Bot type`)" :placeholder="l10n(`Select bot type`)" required="true" :store="store" triggerAction="all" valueField="id" @change="_onBotTypeChange" @ready="_onBotTypeComboReady"/>

                        <ext-displayfield :label="l10n(`Bot description`)"/>

                        <ext-container ref="descriptionContainer" flex="1" scrollable="true"/>

                        <ext-toolbar docked="bottom">
                            <ext-spacer/>
                            <ext-button iconAlign="right" iconCls="fa-solid fa-arrow-right" :text="l10n(`Next step`)" ui="action" @tap="_checkApiToken"/>
                        </ext-toolbar>
                    </ext-fieldpanel>

                    <!-- create bot panel -->
                    <ext-fieldpanel ref="botTypePanel" layout="vbox">
                        <ext-displayfield :label="l10n(`Bot username`)" :value="botInfo?.username"/>

                        <ext-displayfield :label="l10n(`Bot name`)" :value="botInfo?.first_name"/>

                        <ext-displayfield :label="l10n(`Bot type`)" :value="component?.name"/>

                        <ext-displayfield :label="l10n(`Bot description`)"/>

                        <ext-container flex="1" :html="component?.description" scrollable="true"/>

                        <ext-toolbar docked="bottom">
                            <ext-button iconCls="fa-solid fa-arrow-left" :text="l10n(`Back`)" @tap="_back"/>
                            <ext-spacer/>
                            <ext-button :text="l10n(`Create bot`)" ui="action" @tap="_createBot"/>
                        </ext-toolbar>
                    </ext-fieldpanel>
                </ext-panel>
            </template>
        </CardsPanel>
    </ext-dialog>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import telegramComponents from "#src/components/telegram/components";

export default {
    "components": { CardsPanel },

    "emits": [ "botCreate" ],

    data () {
        return {
            "store": null,
            "component": null,
            "botInfo": null,
        };
    },

    "watch": {
        component ( component ) {
            this.$refs.descriptionContainer.ext.setHtml( component?.description || "" );
        },
    },

    "methods": {
        _ready ( e ) {
            e.detail.cmp.setActiveItem( 0 );

            this.ext.setKeyMap( {
                "ENTER": () => {
                    if ( this.$refs.dataPanel.ext.getActiveItemIndex() === 0 ) {
                        this._checkApiToken();
                    }
                    else {
                        this._createBot();
                    }
                },
            } );
        },

        async refresh ( e ) {
            this.$refs.cardsPanel.mask();

            const res = await telegramComponents.getRegisteredComponents();

            this.$refs.cardsPanel.unmask();

            this.$refs.cardsPanel.setResult( res );

            if ( !res.ok ) return;

            this.store = Ext.create( "Ext.data.Store", {
                "remoteSort": false,
                "remoteFilter": false,
                "data": Object.values( res.data ).map( component => component.model ),
            } );
        },

        _onBotTypeComboReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setItemTpl( `
<div style="font-size:1.3em">
    {name}
</div>
<br/>
<div style="max-height:50px;text-overflow:ellipsis">
    {short_description}
</div>
` );
        },

        _onBotTypeChange ( e ) {
            const value = e.detail.newValue;

            this.component = telegramComponents.get( value );
        },

        async _checkApiToken () {
            const form = this.$refs.apiTokenPanel.ext;

            if ( !form.validate() ) return;

            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "telegram/bots/check-bot-api-token", form.getValues().api_token );

            this.$refs.cardsPanel.unmask();

            if ( !res.ok ) {
                this.$toast( res );
            }
            else {
                this.$refs.dataPanel.ext.setActiveItem( this.$refs.botTypePanel.ext );

                this.botInfo = res.data;
            }
        },

        _back () {
            this.$refs.dataPanel.ext.setActiveItem( 0 );
        },

        async _createBot () {
            const form = this.$refs.apiTokenPanel.ext;

            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "telegram/bots/create-bot", form.getValues().api_token, this.component.id );

            this.$refs.cardsPanel.unmask();

            if ( !res.ok ) {
                this.$toast( res );
            }
            else {
                this.$toast( l10n( "Bot created" ) );

                this.$emit( "botCreate" );

                this.ext.close();
            }
        },
    },
};
</script>
