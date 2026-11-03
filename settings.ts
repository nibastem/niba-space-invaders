// Screen resolution is configured at compile time, not changed by a runtime block.
// Remove duplicate userconfig screen constants from your game project.
namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 360
    export const ARCADE_SCREEN_HEIGHT = 320
}

//% color="#B78122" icon="\uf108" block="Invaders Settings"
namespace invadersSettings {
    /** Check whether the compiled game has a 360 by 320 screen. */
    //% blockId=niba_invaders_screen_correct block="screen is 360 x 320?"
    //% weight=100
    export function isScreenCorrect(): boolean {
        return scene.screenWidth() == 360 && scene.screenHeight() == 320
    }

    /** Get the active screen width. */
    //% blockId=niba_invaders_screen_width block="screen width"
    //% weight=90
    export function screenWidth(): number {
        return scene.screenWidth()
    }

    /** Get the active screen height. */
    //% blockId=niba_invaders_screen_height block="screen height"
    //% weight=80
    export function screenHeight(): number {
        return scene.screenHeight()
    }
}
