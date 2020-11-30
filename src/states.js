import body1 from "../assets/body-1.svg"
import body2 from "../assets/body-2.svg"
import bodyWalk1 from "../assets/body-walk-1.svg"
import bodyWalk2 from "../assets/body-walk-2.svg"
import bodyWalk3 from "../assets/body-walk-3.svg"
import bodyWalk4 from "../assets/body-walk-4.svg"

const states = {
  stand: { frames: [body1, body2], rate: 1000 },
  walk: { frames: [bodyWalk1, bodyWalk3, bodyWalk2, bodyWalk4], rate: 375 },
}

export default states
