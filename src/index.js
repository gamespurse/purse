import "./polyfills"

import firebase from "firebase/app"
window.firebase = firebase
require("../init-firebase")

import React from "react"
import { render } from "react-dom"

import "./index.scss"
import Purse from "./Purse"

render(<Purse />, document.getElementById("root"))
