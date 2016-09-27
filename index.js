"use strict"

const _ = require("underscore")
const decamelize = require("decamelize")

let startMiddlewaresFor = rInfo => {
  if (rInfo.startMid)
    return _(rInfo.startMid).map(middfName => require(`../../middlewares/${middfName}`))
}

/**
 * build url helpers and insert in express app
 */
let buildUrlHelpers = (app, config) => {
  let host = config.host
  let routes = config.routes

  if(!app.get("urlhelpers"))
    app.set("urlhelpers", {})

  let urlHelpers = app.get("urlhelpers")

  routes.forEach(rInfo => {
    /* build helper method names */
    let actionName = rInfo.action.charAt(0).toUpperCase() + rInfo.action.slice(1)
    let methodName = `${rInfo.controller.replace("Controller", "")}${actionName}Url`

    /*build methods */
    urlHelpers[methodName] = params => {
      params = params ? params : {}
      let path = rInfo.path
      _.each(params, (v, k) => {
        path = path.replace(`:${k}`, v)
      })
      return `${host}${path}`
    }
  })

  if(config.debug)
    for(let mName in urlHelpers)
      console.log(`${mName}(opts)\t\t\t\t\t\thelper genereted`)
}


let buildRoutes = (app, config) => {
  let controllersPath = config.controllersPath || "../../controllers"
  let routes = config.routes
  let frontMiddlewares = config.frontMiddlewares
  let endMiddlewares = config.endMiddlewares

  /* apply default front middlewares*/
  if(frontMiddlewares)
    app.use(frontMiddlewares)

  routes.forEach(rInfo => {

    /*
     * http verb, corresponding to express route methods,
     * becouse this. "ALL" must works too like Route#all
     */
    let httpVerb = rInfo.method.toLowerCase()

    /*
     * object#method to handle this endpoint
     * lets assume that you need have a controllers folder
     */

    let handler = require(`${controllersPath}/${decamelize(rInfo.controller, "-")}`)[rInfo.action]
    let endPoint = _.compact([ startMiddlewaresFor(rInfo), handler ])

    app[httpVerb](rInfo.path, endPoint)
  })

  /* apply default end middlewares */
  if(endMiddlewares)
    app.use(endMiddlewares)
}


class ExpressRoutesHelper{

  constructor(app) {
    this.app = app
  }

  /* build a helper for each config */
  build(config) {
    buildUrlHelpers(this.app, config)
    buildRoutes(this.app, config)
  }

}


module.exports = ExpressRoutesHelper

/**
 *
 * Example:
 * ===
 *
 * const ExpressRoutesHelper = require("express-routes-helper")
 *
 * let expressRoutesHelper = new ExpressRoutesHelper(app)
 * expressRoutesHelper.build(config)
 *
 */
