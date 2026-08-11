<template>
    <ext-togglefield ref="button" :disabled="disabled" :label="label" :labelAlign="labelAlign" :labelTextAlign="labelTextAlign" :labelWidth="labelWidth" @change="_onChange" @ready="_ready"/>
</template>

<script>
export default {
    "props": {
        "labelAlign": {
            "type": String,
            "default": "left",
        },
        "labelTextAlign": {
            "type": String,
            "default": "left",
        },
        "labelWidth": {
            "type": String,
            "default": null,
        },
        "disabled": {
            "type": Boolean,
            "default": false,
        },
    },

    "computed": {
        label () {
            return l10n( "Use device dark mode" );
        },

        value () {
            return this.$app.theme.deviceDarkMode;
        },
    },

    "watch": {
        value ( value ) {
            this.$refs.button.ext.setValue( value );
        },
    },

    "methods": {
        _ready () {
            this.$refs.button.ext.setValue( this.value );
        },

        _onChange ( e ) {
            this.$app.theme.deviceDarkMode = e.detail.newValue;
        },
    },
};
</script>
