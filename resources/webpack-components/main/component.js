import WebpackComponent from "@corejslib/vue/webpack-components/main";

export default class extends WebpackComponent {

    // properties
    get webpackResolveAlias () {
        return {
            ...super.webpackResolveAlias,
            "#vue": "@corejslib/vue-primevue",
        };
    }

    // public
    validateEnv ( env ) {
        return super.validateEnv( env ) || this._validateEnv( env, import.meta.url );
    }

    // protected
    _buildWebpackConfig () {
        const config = super._buildWebpackConfig();

        // config.module.rules[1].exclude.push( /[\\/]resources[\\/]ext-[\d.]+[\\/]/, /[\\/]resources[\\/]ewc-[\d.]+[\\/]/ );

        // config.optimization.splitChunks.cacheGroups["ext-charts"] = {
        //     "name": "ext-charts",
        //     test ( module ) {
        //         if ( !module.resource ) return;

        //         const resource = module.resource.replaceAll( "\\", "/" );

        //         if ( resource.includes( "@corejslib/ext/src/ext-charts-" ) ) return true;

        //         if ( resource.includes( "@corejslib/ext/resources/ext-" + this.buildOptions.extVersion + "/charts.js" ) ) return true;
        //     },
        //     "priority": -9,
        //     "chunks": "all",
        // };

        config.optimization.splitChunks.cacheGroups[ "froala-editor" ] = {
            "name": "froala-editor",
            "test": /froala-editor[\/\\]/v,
            "priority": -9,
            "chunks": "all",
        };

        config.optimization.splitChunks.cacheGroups[ "amcharts5" ] = {
            "name": "amcharts5",
            "test": /@amcharts[\/\\]amcharts5[\/\\]/v,
            "priority": -9,
            "chunks": "all",
        };

        config.optimization.splitChunks.cacheGroups[ "pdf" ] = {
            "name": "pdf",
            "test": /pdfjs-dist[\/\\]/v,
            "priority": -9,
            "chunks": "all",
        };

        config.optimization.splitChunks.cacheGroups[ "fontawesome" ] = {
            "name": "fa",
            "test": /@fortawesome[\/\\]/v,
            "priority": -9,
            "chunks": "all",
        };

        return config;
    }
}
