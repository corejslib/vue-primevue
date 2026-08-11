<template>
    <ext-dialog :height="height" layout="fit" scrollable="true" :title="l10n(`Development`)" :width="width">
        <AdministrationPanel :apiCallLogEnabled="apiCallLogEnabled">
            <template #tabs>
                <slot name="tabs"/>
            </template>
        </AdministrationPanel>
    </ext-dialog>
</template>

<script>
import AdministrationPanel from "./panel";

export default {
    "components": { AdministrationPanel },

    "props": {
        "width": {
            "type": String,
            "default": "95%",
        },
        "height": {
            "type": String,
            "default": "95%",
        },
        "apiCallLogEnabled": {
            "type": Boolean,
            "default": true,
        },
    },
};
</script>
