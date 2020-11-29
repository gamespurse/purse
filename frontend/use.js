import {
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  CSSProperties,
} from 'react'

import {
  getImage,
  equalGamepads,
} from './functions'

const {
  keys,
  values,
  entries,
} = Object

const {
  min,
  max,
  abs,
  random,
} = Math

const {
  stringify,
  parse,
} = JSON

const {
  log,
  warn,
  error,
} = console

function useLog(obj) {
  const [[key, val]] = entries(obj)

  useEffect(
    () => void log(`${key}: ${val}`),
    [stringify(val)]
  )
}

/**
 * @param {string} src 
 */
function useImage(src) {

  /** @type {[HTMLImageElement, Dispatch<SetStateAction<HTMLImageElement>>]} */
  const [image, setImage] = useState()

  useEffect(() => void getImage(src).then(setImage), [])

  return image
}

function useInnerSize() {
  const [, onResize] = useState()

  useEffect(
    () => {
      addEventListener('resize', onResize)
      return () => removeEventListener('resize', onResize)
    },
    []
  )

  return [innerWidth, innerHeight]
}

function useKeysDown() {
  const [keysDown, setKeysDown] = useState({})

  useEffect(
    () => {
      /**
       * @param {KeyboardEvent} e 
       */
      function onKeyDown(e) {
        setKeysDown(keysDown => {
          const keyDown = e.key in keysDown
          if (keyDown) {
            return keysDown
          }
          return { ...keysDown, [e.key]: true }
        })
      }
      addEventListener('keydown', onKeyDown)
      return () => removeEventListener('keydown', onKeyDown)
    },
    []
  )

  useEffect(
    () => {
      /**
       * @param {KeyboardEvent} e 
       */
      function onKeyUp(e) {
        setKeysDown(({ ...keysDown }) => {
          delete keysDown[e.key]
          return keysDown
        })
      }
      addEventListener('keyup', onKeyUp)
      return () => removeEventListener('keyup', onKeyUp)
    },
    []
  )

  return keysDown
}

/**
 * @param {...number}
 */
function useAnimationFrame() {
  const animationFrame = useRef(NaN)

  /**
   * @typedef FrameMeta
   * @property {number} ms
   * @property {MutableRefObject<number>} timerRef
   * @property {Dispatch<SetStateAction<number>>} setFrame
   */

  /** @type {FrameMeta[]} */
  let metas = new Array(arguments.length)

  /** @type {number[]} */
  let frames = new Array(arguments.length)

  for (const i in arguments) {
    const ms = arguments[i]
    const timerRef = useRef(0)
    const [frame, setFrame] = useState(0)
    metas[i] = { ms, timerRef, setFrame }
    frames[i] = frame
  }

  useEffect(
    () => {
      /**
       * @param {number} t 
       */
      function onAnimationFrame(t) {
        for (const { ms, timerRef, setFrame } of metas) {
          const ready = t > timerRef.current
          if (ready) {
            setFrame(t)
            timerRef.current = t + ms
          }
        }

        animationFrame.current = requestAnimationFrame(onAnimationFrame)
      }

      animationFrame.current = requestAnimationFrame(onAnimationFrame)
      return () => cancelAnimationFrame(animationFrame.current)
    },
    []
  )

  return frames
}

function useGamepad() {

  const [timestamp, updateTimestamp] = useState(NaN)

  /** @type {MutableRefObject<Gamepad>} */
  const gamepadRef = useRef()

  // useLog({ gamepad: timestamp })

  useEffect(
    () => {

      /** @type {FrameRequestCallback} */
      function pollGamepad() {

        const oldGamepad = gamepadRef.current

        /** @type {Gamepad} */
        const gamepad =
          navigator.webkitGetGamepads ? navigator.webkitGetGamepads()[0]
            : navigator.getGamepads()[0]

        const same = equalGamepads(oldGamepad, gamepad)

        if (!same) {
          gamepadRef.current = {
            axes: gamepad.axes,
            buttons: gamepad.buttons,
          }
          updateTimestamp(Date.now())
        }

        requestAnimationFrame(pollGamepad)
      }

      /**
       * @param {GamepadEvent} e 
       */
      function handleGamepadConnected(e) {
        const { index, id, buttons, axes } = e.gamepad
        log('Gamepad connected at index %d: %s. %d buttons, %d axes.', index, id, buttons.length, axes.length)
        requestAnimationFrame(pollGamepad)
      }

      addEventListener('gamepadconnected', handleGamepadConnected)
      return () => removeEventListener('gamepadconnected', handleGamepadConnected)
    },
    []
  )

  return gamepadRef.current
}

/**
 * @typedef {() => Promise<(void | (() => void | undefined))>} AsyncEffectCallback
 */

/**
 * @param {AsyncEffectCallback} effect
 * @param {DependencyList} [deps] 
 */
function useAsync(effect, deps) {
  useEffect(() => void effect(), deps)
}

/**
 * @param {Object.<string, string>} srcMap 
 */
function useImages(srcMap) {

  /** @type {Object.<string, HTMLImageElement>} */
  let imgs = {}

  for (const srcId in srcMap) {
    const src = srcMap[srcId]
    const img = useImage(src)
    imgs[srcId] = img
  }

  return imgs
}

export {
  useLog,
  useImage,
  useInnerSize,
  useKeysDown,
  useAnimationFrame,
  useGamepad,
  useAsync,
  useImages,
}
