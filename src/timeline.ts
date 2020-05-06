import Root from "./Root"
import { render } from "react-dom"
import { createElement } from "react"
import loadScript from "./loadScript"

render(createElement(Root), document.getElementById("react-root"))
