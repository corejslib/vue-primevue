<template>
    <ext-dialog height="350" layout="vbox" :title="l10n(`About the project`)" width="300">
        <ext-fieldpanel defaults='{"labelAlign":"left"}'>
            <ext-displayfield :label="l10n(`UI version`)" :value="frontend.buildVersion"/>
            <ext-displayfield :label="l10n(`UI mode`)" :value="frontend.mode"/>

            <ext-displayfield :label="l10n(`Backend version`)" :value="backend.buildVersion"/>
            <ext-displayfield :label="l10n(`Backend mode`)" :value="backend.mode"/>
        </ext-fieldpanel>

        <ext-toolbar docked="bottom" layout='{"pack":"end","type":"hbox"}'>
            <ext-button iconCls="fa-regular fa-copy" :text="l10n(`Copy to the clipboard`)" ui="action" @tap="_copy"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
export default {
    "computed": {
        backend () {
            return this.$app.settings.backendId || {};
        },

        frontend () {
            return this.$app.settings.frontendId || {};
        },
    },

    "methods": {
        _copy () {
            this.$utils.copyToClipboard( JSON.stringify(
                {
                    "backend": this.$app.settings.backendId,
                    "frontend": this.$app.settings.frontendId,
                },
                null,
                4
            ) );

            this.$toast( l10n( "Version info copied" ) );
        },
    },
};
</script>
