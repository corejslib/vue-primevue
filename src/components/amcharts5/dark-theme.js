import { Color } from "@amcharts/amcharts5/.internal/core//util/Color";
import BaseTheme from "@amcharts/amcharts5/themes/Dark";

class Theme extends BaseTheme {
    setupDefaultRules () {
        super.setupDefaultRules();

        this.rule( "InterfaceColors" ).setAll( {

            // patch tooltips colors
            "alternativeBackground": Color.fromHex( 0 ),
            "text": Color.fromHex( 0xFFFFFF ),
        } );
    }
}

export default Theme;
