<template>
    <ext-dialog height="95%" layout="fit" scrollable="true" :title="l10n(`Monitoring`)" width="95%">
        <Panel/>
    </ext-dialog>
</template>

<script>
import Panel from "./panel";

export default {
    "components": { Panel },
};
</script>
