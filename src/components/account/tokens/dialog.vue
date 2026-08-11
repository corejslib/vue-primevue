<template>
    <ext-dialog height="90%" layout="fit" scrollable="true" :title="l10n(`API access tokens`)" width="850">
        <Panel :hideTitle="true"/>
    </ext-dialog>
</template>

<script>
import Panel from "./panel";

export default {
    "components": { Panel },
};
</script>
