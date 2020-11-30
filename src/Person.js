import './Person.scss'

import '../lib/pico'

import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
  FunctionComponent,
  MutableRefObject,
  Dispatch,
  SetStateAction,
} from 'react'

import anime from 'animejs'

import states from './states'

import {
  isSafari,
} from './browser'

import {
  useInnerSize,
  useAsync,
} from './use'

const {
  keys,
  values,
  entries,
} = Object

function facefinder_classify_region(r, c, s, pixels, ldim) { return -1.0 }

function rgba_to_grayscale(rgba, nrows, ncols) {
  let gray = new Uint8Array(nrows * ncols);
  for (let r = 0; r < nrows; ++r) {
    for (let c = 0; c < ncols; ++c) {
      gray[r * ncols + c] = (2 * rgba[r * 4 * ncols + 4 * c + 0] + 7 * rgba[r * 4 * ncols + 4 * c + 1] + 1 * rgba[r * 4 * ncols + 4 * c + 2]) / 10
    }
  }
  return gray
}

/** @typedef {'stand' | 'walk'} PersonState */
/** @typedef {'left' | 'right'} PersonDir */

/**
 * @typedef PersonProps
 * @property {number[]} pos
 * @property {string} hat
 * @property {string} name
 * @property {PersonState} state
 * @property {PersonDir} dir
 * @property {PersonDir} tilepx
 */

/** @type {FunctionComponent<PersonProps>} */
const Person = person => {

  const [innerWidth, innerHeight] = useInnerSize()
  // useEffect(() => void console.log(`innerWidth ${innerWidth} innerHeight ${innerHeight}`), [innerWidth, innerHeight])

  const [tweening, setTweening] = useState(false)

  /** @type {PersonState} */
  const state =
    person.state
      ? person.state
      : tweening
        ? 'walk'
        : 'stand'

  const [frame, setFrame] = useState(0)
  useEffect(
    () => {
      const { frames, rate } = states[state]
      // console.log(`state ${state}; rate ${rate}`)
      const loop = setInterval(() => setFrame(frame => (frame + 1) % frames.length), rate)
      return () => clearInterval(loop)
    },
    [state]
  )

  // const [x, y] = person.pos
  // const [[oldX, oldY], setOldPos] = useState(person.pos)

  /** @type {MutableRefObject<HTMLDivElement>} */
  const personBoxRef = useRef()

  /** @type {MutableRefObject<HTMLCanvasElement>} */
  const faceCanvasRef = useRef()

  /** @type {MutableRefObject<HTMLVideoElement>} */
  const hiddenVideoRef = useRef()
  /** @type {MutableRefObject<HTMLCanvasElement>} */
  const hiddenCanvasRef = useRef()

  const update_memoryRef = useRef()
  const faceFindFnRef = useRef(facefinder_classify_region)

  // I assume this is for gathering the data for the face recognition
  useAsync(
    async () => {
      update_memoryRef.current = pico.instantiate_detection_memory(1)
      const url = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder'
      const resp = await fetch(url)
      const buf = await resp.arrayBuffer()
      const b = new Int8Array(buf)
      const faceFindFn = pico.unpack_cascade(b)
      faceFindFnRef.current = faceFindFn
    },
    []
  )

  useEffect(
    function () {
      void async function () {
        const hiddenVideo = hiddenVideoRef.current
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        hiddenVideo.srcObject = stream
      }()
    },
    []
  )

  function doAI() {
    const hiddenVideo = hiddenVideoRef.current
    const invCav = hiddenCanvasRef.current

    if (!hiddenVideo.videoWidth || !hiddenVideo.videoHeight) {
      return
    }

    invCav.width = hiddenVideo.videoWidth
    invCav.height = hiddenVideo.videoHeight
    const invCtx = invCav.getContext('2d')
    invCtx.drawImage(hiddenVideo, 0, 0)

    const rgba = invCtx.getImageData(0, 0, invCav.width, invCav.height).data

    const image = {
      pixels: rgba_to_grayscale(rgba, invCav.height, invCav.width),
      nrows: invCav.height,
      ncols: invCav.width,
      ldim: invCav.width
    }

    const params = {
      shiftfactor: 0.1, // move the detection window by 10% of its size
      minsize: 100,     // minimum size of a face
      maxsize: 1000,    // maximum size of a face
      scalefactor: 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
    }

    const update_memory = update_memoryRef.current
    const facefinder_classify_region = faceFindFnRef.current

    // run the cascade over the frame and cluster the obtained detections
    // dets is an array that contains (r, c, s, q) quadruplets
    // (representing row, column, scale and detection score)
    let dets = pico.run_cascade(image, facefinder_classify_region, params)
    dets = update_memory(dets)
    dets = pico.cluster_detections(dets, 0.2) // set IoU threshold to 0.2

    const cav = faceCanvasRef.current
    const ctx = cav.getContext('2d')

    for (const [y, x, diam, thresh] of dets) {
      if (thresh <= 50.0) {
        continue
      }

      cav.width = diam * 1.1
      cav.height = diam * 1.1
      ctx.drawImage(
        invCav,
        x - cav.width / 2 - 0,
        y - cav.height / 2 - 0,
        cav.width,
        cav.height,
        0,
        0,
        cav.width,
        cav.height,
      )
    }
  }

  /** @type {MutableRefObject<number>} */
  const frameRef = useRef()
  const t0Ref = useRef(0)
  const takenRef = useRef(0)

  function loop(t) {
    const t0 = t0Ref.current
    const taken = takenRef.current
    var dt = t - t0

    if (dt >= 777 && taken < 5) {
      doAI()
      t0Ref.current = t
      takenRef.current++
    }

    frameRef.current = requestAnimationFrame(loop)
  }

  useEffect(
    function () {
      frameRef.current = requestAnimationFrame(loop)
      return function () {
        cancelAnimationFrame(frameRef.current)
      }
    },
    []
  )

  const classState = {
    ...person,
    // dir,
    isSafari,
  }
  const classStateString = entries(classState).map(([key, value]) => `${key}_${value}`).join(' ')

  // useEffect(
  //   () => {
  //     const personBox = personBoxRef.current

  //     const isJumping = y < oldY
  //     const isFalling = y > oldY


  //     let easing = 'linear'
  //     if (isJumping) {
  //       // console.log(`isJumping{${isJumping}} = y{${y}} < oldY{${oldY}}`)
  //       // easing = 'easeOutSine'
  //     } else if (isFalling) {
  //       // console.log(`isFalling{${isFalling}} = y{${y}} > oldY{${oldY}}`)
  //       // easing = 'easeInSine'
  //     }

  //     // console.log(`animating person! @ ${x},${y} easing{${easing}}`)

  //     anime({
  //       targets: personBoxRef.current,
  //       translateX: {
  //         value: person.tilepx / 2 - personBox.offsetWidth / 2 + x * person.tilepx,
  //         // easing: 'easeOutElastic()',
  //         duration: 1250,
  //         // duration: 250,
  //       },
  //       translateY: {
  //         value: y * person.tilepx + person.tilepx - personBox.offsetHeight,
  //         easing,
  //         // duration: 125,
  //         duration: 150,
  //       },
  //       scaleX: {
  //         value: person.dir === 'left' ? 1 : -1,
  //         easing: 'easeOutElastic()',
  //         duration: 750,
  //       },
  //       // changeBegin() {
  //       //   setTweening(true)
  //       // },
  //       // changeComplete() {
  //       //   setTweening(false)
  //       // },
  //     })
  //   },
  //   [x, y, person.dir]
  // )

  // // update old position after dir change
  // useEffect(
  //   () => {
  //     const noChange = x === oldX && y === oldY
  //     if (noChange) {
  //       return
  //     }
  //     setOldPos([x, y])
  //   },
  //   [x, y, oldX, oldY, person.dir]
  // )

  return (
    <div
      ref={personBoxRef}
      className="person bounding-box"
      {...person}
    >
      <div className={`person ${classStateString}`}>

        <div className="hidden">
          <video
            ref={hiddenVideoRef}
            autoPlay
            playsInline
          />
          <canvas ref={hiddenCanvasRef} />
        </div>

        {
          Object.keys(states).map(s =>
            states[s].frames.map((body, f) =>
              <img
                key={`${s}:${f}`}
                className={`body ${s === state && f === frame}`}
                src={body}
              />
            )
          )
        }

        <div className="face">
          <canvas ref={faceCanvasRef} />
        </div>

        <div className="hat">{person.hat}</div>

      </div>
    </div>
  )
}

export default Person
