// Demo: paste in a NEW Arcade game's main.ts after importing this extension.
// Do not include this file in the extension's pxt.json.
effects.starField.startScreenEffect()

let raider = img`
    . . 2 2 2 2 . .
    . 2 2 5 5 2 2 .
    2 2 5 2 2 5 2 2
    2 2 2 2 2 2 2 2
    . 2 2 . . 2 2 .
    2 . 2 . . 2 . 2
`
let drone = img`
    . . . 7 7 . . .
    . 7 7 7 7 7 7 .
    7 7 1 7 7 1 7 7
    7 7 7 7 7 7 7 7
    . . 7 7 7 7 . .
    . 7 . 7 7 . 7 .
`
let enemyImages = [raider, drone]

// Two independent formations with distinct unique IDs.
let formationA = formationManager.createFormation(
    enemyImages, 2, 6, 28, 20, 28, 50,
    FormationImagePattern.ByRow
)
let formationB = formationManager.createFormation(
    enemyImages, 1, 4, 30, 20, 90, 145,
    FormationImagePattern.Alternating
)
spaceInvaders.startMovement(formationA, 22, 8)
spaceInvaders.startMovement(formationB, 38, 5)
spaceInvaders.setBottomLimit(formationB, 260)

// A slows formation A; B stops/restarts formation B.
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    spaceInvaders.setSpeed(formationA, 8)
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (spaceInvaders.isMoving(formationB)) {
        spaceInvaders.stopMovement(formationB)
    } else {
        spaceInvaders.startMovement(formationB, 38, 5)
        spaceInvaders.setBottomLimit(formationB, 260)
    }
})

// Uses an intentionally simple example; add player/bullets in your real game.
game.onUpdate(function () {
    if (spaceInvaders.hasReachedBottom(formationA) ||
        spaceInvaders.hasReachedBottom(formationB)) {
        game.gameOver(false)
    }
})
