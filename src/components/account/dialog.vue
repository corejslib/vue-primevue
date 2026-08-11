<template>
    <ext-dialog :height="height" layout="fit" scrollable="true" :title="l10n(`Your account`)" :width="width">
        <AccountPanel>
            <template #tabs>
                <slot name="tabs"/>
            </template>
        </AccountPanel>
    </ext-dialog>
</template>

<script>
import AccountPanel from "./panel";

export default {
    "components": { AccountPanel },

    "props": {
        "width": {
            "type": String,
            "default": "90%",
        },
        "height": {
            "type": String,
            "default": "90%",
        },
    },
};
</script>
