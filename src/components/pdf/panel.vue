<script>
import Panel from "./_panel";
import PdfDialog from "./dialog";

export default {
    "extends": Panel,

    "methods": {
        async maximize () {
            const cmp = await this.$mount( PdfDialog, {
                "props": {
                    "src": this.currentSrc,
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
