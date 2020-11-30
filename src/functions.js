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

/**
 * @param {string} src 
 * @returns {Promise<HTMLImageElement>}
 */
function getImage(src) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = src
  })
}

/**
 * @param {Gamepad} gamepad1 
 * @param {Gamepad} gamepad2 
 */
function equalGamepads(gamepad1, gamepad2) {
  const okPad1 = !!gamepad1
  const okPad2 = !!gamepad2
  const bothOk = okPad1 && okPad2

  if (!bothOk) {
    return okPad1 === okPad2
  }

  const sameAxisCount = gamepad1.axes.length === gamepad2.axes.length
  const sameButtonCount = gamepad1.buttons.length === gamepad2.buttons.length

  if (!sameAxisCount) {
    return false
  }
  if (!sameButtonCount) {
    return false
  }

  for (const i in gamepad1.axes) {
    const same = gamepad1.axes[i] === gamepad2.axes[i]
    if (!same) {
      return false
    }
  }
  for (const i in gamepad1.buttons) {
    const buttonPad1 = gamepad1.buttons[i]
    const buttonPad2 = gamepad2.buttons[i]
    const samePressed = buttonPad1.pressed === buttonPad2.pressed
    const sameTouched = buttonPad1.touched === buttonPad2.touched
    const sameValue = buttonPad1.value === buttonPad2.value
    const same = samePressed && sameTouched && sameValue

    if (!same) {
      return false
    }
  }

  return true
}

Object.defineProperty(String.prototype, 'hashCode', {
  value: function () {
    var hash = 0, i, chr;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
});

export {
  getImage,
  equalGamepads,
}
