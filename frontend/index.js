import "./index.scss"
import "babel-polyfill"
import "@babel/plugin-proposal-optional-chaining"
import "@babel/plugin-proposal-nullish-coalescing-operator"
import React from "react"
import { render } from "react-dom"
import Purse from "./Purse"
render(<Purse />, document.getElementById("root"))
