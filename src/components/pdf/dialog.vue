<template>
    <ext-dialog bodyPadding="0" height="90%" layout="fit" width="90%">
        <PdfPanel :src="src"/>
    </ext-dialog>
</template>

<script>
import PdfPanel from "./_panel";

export default {
    "components": { PdfPanel },

    "props": {
        "src": {
            "type": String,
            "default": null,
        },
        "scale": {
            "type": String,
            "default": "auto",
        },
        "resetZoomOnLoad": {
            "type": Boolean,
            "default": true,
        },
        "zoomStep": {
            "type": Number,
            "default": 0.1,
        },
        "minZoom": {
            "type": Number,
            "default": 0.5,
        },
        "maxZoom": {
            "type": Number,
            "default": 2,
        },
    },
};
</script>
