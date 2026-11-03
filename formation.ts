/** Image selection for a rectangular enemy formation. */
//% block="Formation Image Pattern"
enum FormationImagePattern {
    //% block="same image"
    Same = 0,
    //% block="image per row"
    ByRow = 1,
    //% block="alternating images"
    Alternating = 2
}

//% color="#8052AD" icon="\uf00a" block="Formation Manager"
namespace formationManager {
    let ids: number[] = []
    let groups: Sprite[][] = []
    let nextId = 1
    let destroyListenerInstalled = false

    function findIndex(id: number): number {
        return ids.indexOf(id)
    }

    function installDestroyListener(): void {
        if (destroyListenerInstalled) return
        destroyListenerInstalled = true
        // This extension creates SpriteKind.Enemy sprites.
        sprites.onDestroyed(SpriteKind.Enemy, function (sprite: Sprite) {
            for (let i = 0; i < groups.length; i++) {
                groups[i].removeElement(sprite)
            }
        })
    }

    /** Create a rectangular formation. X/Y is the center of the TOP-LEFT enemy. Returns a unique formation ID. */
    //% blockId=niba_create_formation
    //% block="create formation images $images rows $rows columns $columns gap X $gapX gap Y $gapY start X $startX start Y $startY pattern $pattern"
    //% inlineInputMode=external
    //% rows.defl=2 rows.min=1 rows.max=20
    //% columns.defl=6 columns.min=1 columns.max=30
    //% gapX.defl=36 gapX.min=1
    //% gapY.defl=30 gapY.min=1
    //% startX.defl=36 startY.defl=60
    //% weight=100
    export function createFormation(
        images: Image[], rows: number, columns: number,
        gapX: number, gapY: number, startX: number, startY: number,
        pattern: FormationImagePattern
    ): number {
        if (!images || images.length == 0) return 0
        rows = Math.max(1, Math.floor(rows))
        columns = Math.max(1, Math.floor(columns))
        gapX = Math.max(1, gapX)
        gapY = Math.max(1, gapY)
        installDestroyListener()
        let members: Sprite[] = []
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                let imageIndex = 0
                if (pattern == FormationImagePattern.ByRow) {
                    imageIndex = r % images.length
                } else if (pattern == FormationImagePattern.Alternating) {
                    imageIndex = (r + c) % images.length
                }
                let enemy = sprites.create(images[imageIndex], SpriteKind.Enemy)
                enemy.setPosition(startX + c * gapX, startY + r * gapY)
                enemy.setFlag(SpriteFlag.AutoDestroy, false)
                enemy.setFlag(SpriteFlag.DestroyOnWall, false)
                members.push(enemy)
            }
        }
        let id = nextId
        nextId += 1
        ids.push(id)
        groups.push(members)
        return id
    }

    /** Get the living enemies in a formation. The returned array is managed internally. */
    //% blockId=niba_formation_enemies block="enemies in formation $id"
    //% weight=90
    export function getEnemies(id: number): Sprite[] {
        let i = findIndex(id)
        if (i < 0) return []
        return groups[i]
    }

    /** Number of enemies still alive in the formation. */
    //% blockId=niba_formation_count block="enemies remaining in formation $id"
    //% weight=80
    export function remaining(id: number): number {
        return getEnemies(id).length
    }

    /** True if a known formation has no enemies remaining. */
    //% blockId=niba_formation_defeated block="formation $id defeated?"
    //% weight=70
    export function isDefeated(id: number): boolean {
        return exists(id) && remaining(id) == 0
    }

    /** True if the formation ID has been created and not cleared. */
    //% blockId=niba_formation_exists block="formation $id exists?"
    //% weight=60
    export function exists(id: number): boolean {
        return findIndex(id) >= 0
    }

    /** Move the formation so the center of its leftmost/topmost enemy is at X/Y. */
    //% blockId=niba_formation_position block="set formation $id top-left enemy center X $x Y $y"
    //% x.defl=36 y.defl=60
    //% weight=50
    export function setPosition(id: number, x: number, y: number): void {
        let enemies = getEnemies(id)
        if (enemies.length == 0) return
        let left = enemies[0].x
        let top = enemies[0].y
        for (let enemy of enemies) {
            if (enemy.x < left) left = enemy.x
            if (enemy.y < top) top = enemy.y
        }
        let dx = x - left
        let dy = y - top
        for (let enemy of enemies) {
            enemy.x += dx
            enemy.y += dy
        }
    }

    /** Destroy all sprites in one formation and retire its ID. */
    //% blockId=niba_formation_clear block="clear formation $id"
    //% weight=40
    export function clearFormation(id: number): void {
        let i = findIndex(id)
        if (i < 0) return
        let members = groups[i].slice()
        // Retire first so destroy callbacks cannot mutate the group being cleared.
        ids.removeAt(i)
        groups.removeAt(i)
        for (let enemy of members) {
            enemy.destroy()
        }
    }

    /** Destroy all managed formations. */
    //% blockId=niba_formation_clear_all block="clear all formations"
    //% weight=30
    export function clearAll(): void {
        let currentIds = ids.slice()
        for (let id of currentIds) {
            clearFormation(id)
        }
    }
}
