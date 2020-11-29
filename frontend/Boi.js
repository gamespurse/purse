import './Boi.scss'

import React, {
  useState,
  useEffect,
  FunctionComponent,
} from 'react'

import Button from '@material-ui/core/Button'

const {
  random,
} = Math

/**
 * @typedef BoiProps
 * @property {string} dir
 * @property {string} skin
 * @property {boolean} me
 */

/** @type {FunctionComponent<BoiProps>} */
const Boi = props => {

  const facingUp = props.dir === 'up'

  const [turnHeadDir, setTurnHeadDir] = useState(0)
  useEffect(
    () => {
      const left = props.dir === 'left'
      const right = props.dir === 'right'
      if (left) {
        setTurnHeadDir(-1)
      } else if (right) {
        setTurnHeadDir(1)
      }
    },
    [props.dir]
  )

  return (
    <div className={`Boi dir-${props.dir}`}>
      <Button
        className={`Button Skin-${props.skin}`}
        variant="contained"
        disableElevation
      >
        <div
          className={`Face`}
          style={facingUp ? {
            transform: `translate(${48 * turnHeadDir}px, -16px)`,
          } : {}}
        >
          <div className={`Eye Left`}></div>
          <div className={`Eye Right`}></div>
        </div>

      </Button>
    </div>
  )
}

export default Boi
