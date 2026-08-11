<template>
    <ext-container layout='{"align":"start","type":"hbox"}'>
        <ext-container layout='{"type":"vbox"}' :width="labelWidth">
            <ext-container :html="label" style="font-size: 1.3em"/>
            <ext-container :html="description"/>
        </ext-container>

        <ext-container flex="1">
            <slot name="option"/>
        </ext-container>
    </ext-container>
</template>

<script>
export default {
    "props": {
        "label": {
            "type": String,
            "required": true,
        },
        "description": {
            "type": String,
            "default": "",
        },
        "labelWidth": {
            "type": Number,
            "default": 100,
        },
    },
};
</script>
