import React, {
  useEffect,
  useState,
  useRef,
  FunctionComponent,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  CSSProperties,
} from 'react'
import 'firebase/app'
import 'firebase/auth'

import './Purse.scss'

import vehicle_pngs from '../assets/vehicles/*.png'
import ghost_pngs from '../assets/ghosts/*.png'

import Sprite, { Direction } from './Sprite'

import { useAnimationFrame, useInnerSize, useKeysDown, useLog, useGamepad } from './use'

const { keys, values, entries } = Object
const { min, max, abs, random, ceil } = Math
const { stringify, parse } = JSON
const { log, warn, error } = console

const vehicleNames = keys(vehicle_pngs)
log(`vehicleNames: ${vehicleNames}`)

const ghostNames = keys(ghost_pngs)
log(`ghostNames: ${ghostNames}`)
const randomGhost = () => ~~(random() * ghostNames.length)

export const DIR_UP = 1 << 0,
  DIR_RIGHT = 1 << 1,
  DIR_DOWN = 1 << 2,
  DIR_LEFT = 1 << 3

export const EFFECT_FACE_UP = 1 << 0,
  EFFECT_FACE_RIGHT = 1 << 1,
  EFFECT_FACE_DOWN = 1 << 2,
  EFFECT_FACE_LEFT = 1 << 3,
  EFFECT_MOVE_UP = 1 << 4,
  EFFECT_MOVE_RIGHT = 1 << 5,
  EFFECT_MOVE_DOWN = 1 << 6,
  EFFECT_MOVE_LEFT = 1 << 7,
  EFFECT_PUSHED_UP = 1 << 8,
  EFFECT_PUSHED_RIGHT = 1 << 9,
  EFFECT_PUSHED_DOWN = 1 << 10,
  EFFECT_PUSHED_LEFT = 1 << 11,
  EFFECT_PULLED_UP = 1 << 12,
  EFFECT_PULLED_RIGHT = 1 << 13,
  EFFECT_PULLED_DOWN = 1 << 14,
  EFFECT_PULLED_LEFT = 1 << 15,
  EFFECT_PULL_UP = 1 << 16,
  EFFECT_PULL_RIGHT = 1 << 17,
  EFFECT_PULL_DOWN = 1 << 18,
  EFFECT_PULL_LEFT = 1 << 19,
  EFFECT_SHOVED_UP = 1 << 20,
  EFFECT_SHOVED_RIGHT = 1 << 21,
  EFFECT_SHOVED_DOWN = 1 << 22,
  EFFECT_SHOVED_LEFT = 1 << 23,
  EFFECT_SHOVE_UP = 1 << 24,
  EFFECT_SHOVE_RIGHT = 1 << 25,
  EFFECT_SHOVE_DOWN = 1 << 26,
  EFFECT_SHOVE_LEFT = 1 << 27

const ALL_EFFECT_FACE = EFFECT_FACE_UP | EFFECT_FACE_RIGHT | EFFECT_FACE_DOWN | EFFECT_FACE_LEFT
window.ALL_EFFECT_FACE = ALL_EFFECT_FACE

const ALL_EFFECT_MOVE = EFFECT_MOVE_UP | EFFECT_MOVE_RIGHT | EFFECT_MOVE_DOWN | EFFECT_MOVE_LEFT
window.ALL_EFFECT_MOVE = ALL_EFFECT_MOVE

const ghostHeights = {
  ghost0: 2,
  ghost1: 2,
  ghost2: 2,
  ghost3: 2,
  ghost4: 2,
  ghost5: 2,
  ghost6: 2,
  ghost7: 2,
  ghost8: 2,
  ghost9: 2,
}

/** @type {FunctionComponent<void>} */
const Purse = () => {
  /** @type {[firebase.auth.UserCredential, Dispatch<SetStateAction<firebase.auth.UserCredential>>]} */
  const [userCred, setUserCred] = useState()
  const uid = userCred?.user?.uid

  useEffect(() => {
    firebase.auth().signInAnonymously().then(setUserCred)
  }, [])
  window.uid = uid

  useLog({ uid })

  return <div>{uid && <PurseOnline uid={uid} />}</div>
}

/**
 * @typedef PurseOnlineProps
 * @property {string} uid
 */

/** @type {FunctionComponent<PurseOnlineProps>} */
const PurseOnline = props => {
  const { uid } = props
  window.uid = uid

  const gamepad = useGamepad()

  const tilemapRef = useRef()
  const tilesRef = useRef()

  const [innerWidth, innerHeight] = useInnerSize()
  const innerMin = min(innerWidth, innerHeight)

  const [mapNum, setMapNum] = useState(0)
  window.setMapNum = setMapNum

  const wTilemapTiles = 19
  const hTilemapTiles = 19

  const screenBoxTiles = 9
  const tilePx = 32
  const screenBoxPx = tilePx * screenBoxTiles
  const wTilemapPx = tilePx * wTilemapTiles
  const hTilemapPx = tilePx * hTilemapTiles

  const boxScale = /* 1 // */ innerMin / screenBoxPx

  useLog({ boxScale })

  /**
   * @typedef Entity
   * @property {number} x
   * @property {number} y
   * @property {number} w
   * @property {number} h
   * @property {number} eff
   *
   * @typedef HasVehicle
   * @property {string} vehicle
   * @property {Direction} dir
   *
   * @typedef {Entity & HasVehicle} EntVehicle
   *
   * @typedef {Entity | EntVehicle} AnyEntity
   */

  /** @type {[Object.<string, AnyEntity>, Dispatch<SetStateAction<Object.<string, AnyEntity>>>]} */
  const [ents, setEnts] = useState(() => {
    const randGhost1 = randomGhost()
    const randGhost2 = randomGhost()
    return {
      [uid]: {
        x: 4,
        y: 4,
        w: 2,
        h: ghostHeights[ghostNames[randGhost1]],
        eff: 0,
        ghost: ghostNames[randGhost1],
      },
      npc: {
        x: 1,
        y: 2,
        w: 2,
        h: ghostHeights[ghostNames[randGhost2]],
        eff: 0,
        ghost: ghostNames[randGhost2],
      },
    }
  })
  window.ents = ents
  useLog({ ents: stringify(keys(ents), null, 2) })

  // const ent = ents[uid] ?? {}
  // const { x, y, eff } = ent
  // useLog({ eff })

  const keysDown = useKeysDown()

  const inertMs = 200
  const animMs = 500
  const [inertNow, animNow] = useAnimationFrame(inertMs, animMs)

  // const utc = new Date().getTime()

  // useEffect(
  //   () => {
  //     const n = utc % 10
  //     const faceIdx = ~~((n) / (10 / 4))
  //   },
  //   [animNow]
  // )

  const dir = ents[uid] ? ents[uid].dir : undefined

  const movingJoyUp = gamepad && ~~(gamepad.axes[1] - 0.5) < 0
  const movingJoyRight = gamepad && ~~(gamepad.axes[0] + 0.5) > 0
  const movingJoyDown = gamepad && ~~(gamepad.axes[1] + 0.5) > 0
  const movingJoyLeft = gamepad && ~~(gamepad.axes[0] - 0.5) < 0

  const holdingUp = 'ArrowUp' in keysDown || 'w' in keysDown || movingJoyUp
  const holdingRight = 'ArrowRight' in keysDown || 'd' in keysDown || movingJoyRight
  const holdingDown = 'ArrowDown' in keysDown || 's' in keysDown || movingJoyDown
  const holdingLeft = 'ArrowLeft' in keysDown || 'a' in keysDown || movingJoyLeft

  const faceEffect =
    // holdingUp ? EFFECT_FACE_UP :
    holdingRight
      ? EFFECT_FACE_RIGHT
      : // holdingDown ? EFFECT_FACE_DOWN :
      holdingLeft
      ? EFFECT_FACE_LEFT
      : 0

  const moveXEffect =
    holdingRight && dir !== 'left' ? EFFECT_MOVE_RIGHT : holdingLeft && dir !== 'right' ? EFFECT_MOVE_LEFT : 0

  const moveYEffect = holdingUp && dir !== 'down' ? EFFECT_MOVE_UP : holdingDown && dir !== 'up' ? EFFECT_MOVE_DOWN : 0

  const moveEffect = moveXEffect | moveYEffect

  useEffect(() => {
    setEnts(ents => ({
      ...ents,
      [uid]: {
        ...ents[uid],
        eff: (ents[uid].eff & ~ALL_EFFECT_FACE) | faceEffect,
      },
    }))
  }, [faceEffect])

  useEffect(() => {
    setEnts(ents => ({
      ...ents,
      [uid]: {
        ...ents[uid],
        eff: (ents[uid].eff & ~ALL_EFFECT_MOVE) | moveEffect,
      },
    }))
  }, [moveEffect])

  useEffect(() => {
    const nextEnts = { ...ents }

    for (const id in nextEnts) {
      const ent = nextEnts[id]
      const { x, y, w, h, eff } = ent

      const faceEff = eff & ALL_EFFECT_FACE

      const faceX = (faceEff & EFFECT_FACE_LEFT) ^ (faceEff & EFFECT_FACE_RIGHT)
      const faceY = (faceEff & EFFECT_FACE_UP) ^ (faceEff & EFFECT_FACE_DOWN)
      const tryFace = faceY | faceX

      const moveEff = eff & ALL_EFFECT_MOVE

      if (tryFace) {
        const newdir = {
          [EFFECT_FACE_UP]: 'up',
          [EFFECT_FACE_RIGHT]: 'right',
          [EFFECT_FACE_DOWN]: 'down',
          [EFFECT_FACE_LEFT]: 'left',
        }[faceEff]

        ent.dir = newdir
      }

      if (moveEff) {
        const moveLeft = Boolean(moveEff & EFFECT_MOVE_LEFT)
        const moveRight = Boolean(moveEff & EFFECT_MOVE_RIGHT)
        const moveUp = Boolean(moveEff & EFFECT_MOVE_UP)
        const moveDown = Boolean(moveEff & EFFECT_MOVE_DOWN)

        let dx = x
        let dy = y

        if (moveLeft ^ moveRight) {
          if (moveLeft) {
            dx = x - 1
          } else if (moveRight) {
            dx = x + 1
          }
        }

        if (moveUp ^ moveDown) {
          if (moveUp) {
            dy = y - 1
          } else if (moveDown) {
            dy = y + 1
          }
        }

        let moveXOk = true
        let moveYOk = true
        for (const enemyId in ents) {
          if (enemyId === id) {
            continue
          }

          const enemy = ents[enemyId]

          const l = dx
          const t = dy
          const r = dx + w - 1
          const b = dy + h - 1
          const enemyL = enemy.x
          const enemyT = enemy.y
          const enemyR = enemy.x + enemy.w - 1
          const enemyB = enemy.y + enemy.h - 1

          const rightOk = r < enemyL || r > enemyR
          const leftOk = l < enemyL || l > enemyR
          const bottomOk = b < enemyT || b > enemyB
          const topOk = t < enemyT || t > enemyB

          const xOk = (leftOk && rightOk) || (topOk && bottomOk)
          const yOk = (topOk && bottomOk) || (leftOk && rightOk)

          if (!xOk) {
            moveXOk = false
          }
          if (!yOk) {
            moveYOk = false
          }
        }

        const xInBounds = dx >= 0 && dx + w <= wTilemapTiles
        const yInBounds = dy >= 0 && dy + h <= hTilemapTiles

        if (moveXOk && xInBounds) {
          ent.x = dx
        }
        if (moveYOk && yInBounds) {
          ent.y = dy
        }
      }

      ent.eff = ent.eff & ~ALL_EFFECT_FACE
    }

    setEnts(nextEnts)
  }, [inertNow])

  return (
    <div className={`Purse moveEffect-${moveEffect}`}>
      <div
        className={`Screenbox`}
        style={{
          width: `${screenBoxPx}px`,
          height: `${screenBoxPx}px`,
          transform: `translate(-50%,-50%) scale(${boxScale})`,
        }}
      >
        <div ref={tilemapRef} className={`Tilemap`}>
          <canvas ref={tilesRef} className={`Tiles`} width={wTilemapPx} height={hTilemapPx} />

          {entries(ents)
            .sort(([key_a, { y: y_a }], [, { y: y_b }]) => {
              const differentYAxis = y_a !== y_b
              const regularDepthCalc = y_a - y_b
              const renderUsAbove = key_a === uid

              if (differentYAxis) {
                return regularDepthCalc
              }

              if (renderUsAbove) {
                return 1
              }

              return -1
            })
            .map(([key, e]) => {
              // const vehicle = vehicleNames[abs(key.hashCode()) % vehicleNames.length]
              // const image = vehicleImages[e.vehicle] || {}

              // const wTiles = ~~(image.width / tilePx)
              // const hTiles = max(ceil(image.height / 2 / tilePx) - 1, 1)
              // const hTiles = vehicleHeights[e.vehicle]

              // log(`${key}: ${stringify({ [key]: { wTiles, hTiles } })}`)

              return (
                <Sprite
                  key={key}
                  me={key === uid}
                  x={e.x}
                  y={e.y}
                  w={e.w}
                  h={e.h}
                  spriteOnSheetDir={'right'}
                  dir={e.dir}
                  tilemap={tilemapRef}
                  inertMs={inertMs}
                >
                  <img className="ghost" src={ghost_pngs[e.ghost]} />
                </Sprite>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default Purse
