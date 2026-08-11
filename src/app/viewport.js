import "@fortawesome/fontawesome-free/css/all.min.css";
import VueViewport from "@corejslib/vue/app/viewport";
import PrimeVue from "primevue/config";

export default class VueExtViewport extends VueViewport {

    // public
    async init () {

        // set theme listeners
        this.app.theme.on( "darkModeChange", this.#applyTheme.bind( this ) );
        this.app.theme.on( "themeChange", this.#applyTheme.bind( this ) );

        // apply theme
        this.#applyTheme();

        await super.init();

        window[ Symbol.for( "app" ) ] = this.app;
    }

    // protected
    // XXX use router
    _createVauApp () {
        const vue = super._createVauApp();

        // vue use( router )
        vue.use( PrimeVue );

        return vue;
    }

    // private
    // XXX
    #applyTheme () {

        // Ext.theme.Material.setColors( {
        //     ...this.app.theme.theme,
        //     "darkMode": this.app.theme.darkMode,
        // } );
    }
}
