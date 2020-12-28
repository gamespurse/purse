import './Sprite.scss'

import React, {
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  CSSProperties,
  FunctionComponent,
} from 'react'

import anime from 'animejs'

const { keys, values, entries } = Object
const { min, max, abs, random, ceil } = Math
const { stringify, parse } = JSON
const { log, warn, error } = console

/** @typedef {'left' | 'right'} Horizontal */
/** @typedef {'up' | 'down'} Vertical */
/** @typedef {Horizontal | Vertical} Direction */

/**
 * @typedef SpriteProps
 * @property {boolean} me
 * @property {HTMLImageElement} spriteSheet
 * @property {number} spriteIdx
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {MutableRefObject<HTMLElement>} tilemap
 * @property {number} inertMs
 * @property {Horizontal} spriteOnSheetDir
 * @property {Direction} dir
 * @property {CSSProperties} style
 */

/** @type {FunctionComponent<SpriteProps>} */
const Sprite = props => {
  /** @type {MutableRefObject<HTMLElement>} */
  const spriteRef = useRef()

  const { x, y, w, h, spriteOnSheetDir, dir } = props

  const screenBoxTiles = 9
  const wTilemapTiles = 19
  const hTilemapTiles = 19
  const tilePx = 32

  const [scaleX, setScaleX] = useState(1)
  const [scaleY, setScaleY] = useState(1)
  useEffect(() => {
    if (!spriteOnSheetDir) {
      return
    }

    const naturallyLeft = spriteOnSheetDir === 'left'
    const naturallyRight = spriteOnSheetDir === 'right'
    const naturallyUp = spriteOnSheetDir === 'right'
    const naturallyDown = spriteOnSheetDir === 'left'
    const faceRight = dir === 'right'
    const faceLeft = dir === 'left'
    const faceDown = dir === 'down'
    const faceUp = dir === 'up'
    const flipX = (naturallyLeft && faceRight) || (naturallyRight && faceLeft)
    const unflipX = (naturallyLeft && faceLeft) || (naturallyRight && faceRight)
    const flipY = (naturallyUp && faceDown) || (naturallyDown && faceUp)
    const unflipY = (naturallyUp && faceUp) || (naturallyDown && faceDown)

    if (flipX) {
      setScaleX(-1)
    } else if (unflipX) {
      setScaleX(1)
    }

    if (flipY) {
      setScaleY(-1)
    } else if (unflipY) {
      setScaleY(1)
    }
  }, [spriteOnSheetDir, dir])

  useEffect(() => {
    anime({
      targets: spriteRef.current,
      translateX: {
        value: x * tilePx,
        duration: 2000,
      },
      translateY: {
        value: y * tilePx,
        duration: 2000,
      },
      scaleX: {
        value: scaleX,
        easing: 'easeOutElastic()',
        duration: 1000,
      },
      scaleY: {
        value: scaleY,
        easing: 'easeOutElastic()',
        duration: 1000,
      },
    })

    const moveCamera = props.me

    if (moveCamera) {
      const dwtiles = wTilemapTiles - screenBoxTiles
      const dhtiles = hTilemapTiles - screenBoxTiles

      let translateX = -(dwtiles >= 0 ? max(0, min(dwtiles, x - screenBoxTiles / 2 + w / 2)) : dwtiles / 2) * tilePx
      let translateY = -(dhtiles >= 0 ? max(0, min(dhtiles, y - screenBoxTiles / 2 + h / 2)) : dhtiles / 2) * tilePx

      anime({
        targets: props.tilemap.current,
        duration: 2000,
        translateX,
        translateY,
      })
    }
  }, [x, y, w, h, scaleX])

  return (
    <div
      ref={spriteRef}
      className={`Sprite spriteOnSheetDir-${props.spriteOnSheetDir} dir-${props.dir}`}
      style={{
        ...(props.style || {}),
        width: `${w * tilePx}px`,
        height: `${h * tilePx}px`,
      }}
    >
      {props.children}
    </div>
  )
}

export default Sprite
