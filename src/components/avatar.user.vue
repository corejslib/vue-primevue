<template>
    <ext-avatar :height="height" :src="src" :width="width"/>
</template>

<script>
export default {
    "props": {
        "width": {
            "type": String,
            "default": "32",
        },
        "height": {
            "type": String,
            "default": "32",
        },
    },

    "computed": {
        src () {
            return this.$app.user.avatarUrl;
        },
    },
};
</script>
