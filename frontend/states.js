import body1 from '../resources/body-1.svg'
import body2 from '../resources/body-2.svg'
import bodyWalk1 from '../resources/body-walk-1.svg'
import bodyWalk2 from '../resources/body-walk-2.svg'
import bodyWalk3 from '../resources/body-walk-3.svg'
import bodyWalk4 from '../resources/body-walk-4.svg'

const states = {
  stand: { frames: [body1, body2], rate: 1000 },
  walk: { frames: [bodyWalk1, bodyWalk3, bodyWalk2, bodyWalk4], rate: 375 },
}

export default states
