
/**
 * NIBA Space Invaders
 * Player Shooting Manager
 */

//% color="#B14D81" weight=85 icon="\uf05b" block="Player Shooting"
namespace playerShooting {

    let playerSprite: Sprite = null
    let projectileImage: Image = null

    let projectileSpeed = 150
    let shootingDelay = 250

    let shootingEnabled = false
    let updateRegistered = false
    let nextShotTime = 0

    /**
     * Enable shooting upwards while A is held.
     * Speed is pixels per second.
     * Delay is milliseconds between shots.
     */
    //% blockId=niba_enable_player_shooting
    //% block="enable player shooting | player $player projectile image $image speed $speed delay (ms) $delay"
    //% player.shadow=variables_get
    //% image.shadow=screen_image_picker
    //% speed.defl=150
    //% speed.min=1
    //% delay.defl=250
    //% delay.min=1
    //% weight=100
    export function enableShooting(
        player: Sprite,
        image: Image,
        speed: number,
        delay: number
    ): void {

        playerSprite = player
        projectileImage = image

        projectileSpeed = Math.max(1, Math.abs(speed))
        shootingDelay = Math.max(1, delay)

        nextShotTime = 0
        shootingEnabled = true

        // Register the shooting loop only once.
        if (!updateRegistered) {
            updateRegistered = true

            game.onUpdate(function () {
                if (!shootingEnabled) {
                    return
                }

                if (!playerSprite || !projectileImage) {
                    return
                }

                if (controller.A.isPressed()) {
                    if (game.runtime() >= nextShotTime) {

                        // Always shoot straight up.
                        let projectile =
                            sprites.createProjectileFromSprite(
                                projectileImage,
                                playerSprite,
                                0,
                                -projectileSpeed
                            )

                        // Position shot above the ship.
                        projectile.bottom = playerSprite.top

                        // Set next allowed firing time.
                        nextShotTime =
                            game.runtime() + shootingDelay
                    }
                }
            })
        }
    }

    /**
     * Disable player shooting.
     */
    //% blockId=niba_disable_player_shooting
    //% block="disable player shooting"
    //% weight=90
    export function disableShooting(): void {
        shootingEnabled = false
    }

    /**
     * Change projectile speed while playing.
     */
    //% blockId=niba_set_projectile_speed
    //% block="set player projectile speed to $speed"
    //% speed.defl=150
    //% weight=80
    export function setSpeed(speed: number): void {
        projectileSpeed = Math.max(1, Math.abs(speed))
    }

    /**
     * Change firing delay while playing.
     */
    //% blockId=niba_set_shooting_delay
    //% block="set shooting delay to $delay ms"
    //% delay.defl=250
    //% weight=70
    export function setDelay(delay: number): void {
        shootingDelay = Math.max(1, delay)
    }
}
