//% color="#247FA1" icon="\uf0ec" block="Movement Manager"
namespace spaceInvaders {
    let trackedIds: number[] = []
    let speeds: number[] = []
    let drops: number[] = []
    let directions: number[] = []
    let moving: boolean[] = []
    let bottomFlags: boolean[] = []
    let bottomLimits: number[] = []
    let handlerInstalled = false

    function indexOfFormation(id: number): number {
        return trackedIds.indexOf(id)
    }

    function registerUpdate(): void {
        if (handlerInstalled) return
        handlerInstalled = true
        game.onUpdate(function () {
            updateAll()
        })
    }

//% blockId="niba_start_formation_movement"
//% block="start formation $id moving at speed $speed drop $dropDistance"
//% id.defl=1
//% speed.defl=30
//% dropDistance.defl=8
//% weight=100
    export function startMovement(id: number, speed: number, dropDistance: number): void {
        if (!formationManager.exists(id)) return
        let members = formationManager.getEnemies(id)
        if (members.length == 0) return
        let idx = indexOfFormation(id)
        if (idx < 0) {
            idx = trackedIds.length
            trackedIds.push(id)
            speeds.push(0)
            drops.push(0)
            directions.push(1)
            moving.push(false)
            bottomFlags.push(false)
            bottomLimits.push(scene.screenHeight())
        }
        speeds[idx] = Math.abs(speed)
        drops[idx] = Math.max(0, dropDistance)
        directions[idx] = 1
        moving[idx] = true
        bottomFlags[idx] = false
        bottomLimits[idx] = scene.screenHeight()
        for (let enemy of members) {
            enemy.setFlag(SpriteFlag.AutoDestroy, false)
            enemy.setFlag(SpriteFlag.DestroyOnWall, false)
            enemy.vx = speeds[idx]
        }
        registerUpdate()
    }

//% blockId="niba_stop_formation_movement"
//% block="stop movement for formation $id"
//% id.defl=1
//% weight=90
    export function stopMovement(id: number): void {
        let idx = indexOfFormation(id)
        if (idx < 0) return
        moving[idx] = false
        for (let enemy of formationManager.getEnemies(id)) {
            enemy.vx = 0
        }
    }

//% blockId="niba_set_formation_speed"
//% block="set movement speed for formation $id to $speed"
//% id.defl=1
//% speed.defl=40
//% weight=80
    export function setSpeed(id: number, speed: number): void {
        let idx = indexOfFormation(id)
        if (idx < 0) return
        speeds[idx] = Math.abs(speed)
        if (moving[idx]) {
            for (let enemy of formationManager.getEnemies(id)) {
                enemy.vx = directions[idx] * speeds[idx]
            }
        }
    }

    /** Set how far this formation descends when it turns at an edge. */
    //% blockId=niba_set_formation_drop block="set formation $id drop distance to $distance"
    //% distance.defl=8 distance.min=0
    //% weight=70
    export function setDropDistance(id: number, distance: number): void {
        let idx = indexOfFormation(id)
        if (idx < 0) return
        drops[idx] = Math.max(0, distance)
    }

    /** Set the Y-coordinate of the defensive bottom line. */
    //% blockId=niba_set_formation_bottom block="set formation $id bottom limit Y $y"
    //% y.defl=240
    //% weight=60
    export function setBottomLimit(id: number, y: number): void {
        let idx = indexOfFormation(id)
        if (idx < 0) return
        bottomLimits[idx] = y
    }

//% blockId="niba_formation_bottom_reached"
//% block="has formation $id reached bottom?"
//% id.defl=1
//% weight=50
    export function hasReachedBottom(id: number): boolean {
        let idx = indexOfFormation(id)
        return idx >= 0 && bottomFlags[idx]
    }

    /** Whether a formation's movement engine is currently active. */
    //% blockId=niba_formation_is_moving block="formation $id is moving?"
    //% weight=40
    export function isMoving(id: number): boolean {
        let idx = indexOfFormation(id)
        return idx >= 0 && moving[idx]
    }

    /** Forget movement settings for a cleared formation (optional cleanup). */
    //% blockId=niba_forget_formation_movement block="forget formation $id movement settings"
    //% weight=30 advanced=true
    export function forgetMovement(id: number): void {
        stopMovement(id)
        let idx = indexOfFormation(id)
        if (idx < 0) return
        trackedIds.removeAt(idx)
        speeds.removeAt(idx)
        drops.removeAt(idx)
        directions.removeAt(idx)
        moving.removeAt(idx)
        bottomFlags.removeAt(idx)
        bottomLimits.removeAt(idx)
    }

    function updateAll(): void {
        for (let i = 0; i < trackedIds.length; i++) {
            if (!moving[i]) continue
            let id = trackedIds[i]
            if (!formationManager.exists(id)) {
                moving[i] = false
                continue
            }
            let members = formationManager.getEnemies(id)
            if (members.length == 0) {
                moving[i] = false
                continue
            }
            let left = members[0].left
            let right = members[0].right
            let bottom = members[0].bottom
            for (let enemy of members) {
                if (enemy.left < left) left = enemy.left
                if (enemy.right > right) right = enemy.right
                if (enemy.bottom > bottom) bottom = enemy.bottom
            }
            if (bottom >= bottomLimits[i]) {
                bottomFlags[i] = true
                stopMovement(id)
                continue
            }
            if (directions[i] == 1 && right >= scene.screenWidth()) {
                let correction = right - scene.screenWidth()
                for (let enemy of members) {
                    enemy.x -= correction
                    enemy.y += drops[i]
                    enemy.vx = -speeds[i]
                }
                directions[i] = -1
            } else if (directions[i] == -1 && left <= 0) {
                let correction = -left
                for (let enemy of members) {
                    enemy.x += correction
                    enemy.y += drops[i]
                    enemy.vx = speeds[i]
                }
                directions[i] = 1
            }
            // A downward step may cross the limit in this same frame.
            for (let enemy of members) {
                if (enemy.bottom >= bottomLimits[i]) {
                    bottomFlags[i] = true
                    stopMovement(id)
                    break
                }
            }
        }
    }
}
