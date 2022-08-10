import React from "react";
import reactDom from "react-dom";
import App from "./src/App"

require('dotenv').config()

reactDom.render(<App />, document.getElementById("root"));