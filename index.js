"use strict"

const _ = require("underscore")
const decamelize = require("decamelize")
const camelcase = require("camelcase")
const upperCamelCase = require("uppercamelcase")

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

    let methodName
    /* build helper method names */
    /* custom method Name */
    if(rInfo.as){
      methodName =  `${rInfo.as}Url`
    /* to: "controller#action" syntax*/
    }else if(rInfo.to){
      let pathSplited = rInfo.to.split("#")
      methodName = camelcase(`${pathSplited[0]}_${pathSplited[1]}_Url`)
    /* by all parameters */
    } else {
      let ctrlName = rInfo.controller.replace("Controller", "")
      methodName = camelcase(`${ctrlName}_${rInfo.action}_Url`)
    }

    /* build methods */
    if(!urlHelpers[methodName]){
      urlHelpers[methodName] = params => {
        params = params ? params : {}
        let path = rInfo.path || rInfo.from.split(" ")[1]
        _.each(params, (v, k) => {
          console.log(k,v)
          debugger
          path = path.replace(`:${k}`, v)
        })
        return `${host}${path}`
      }
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
    let httpVerb =  rInfo.from ? rInfo.from.split(" ")[0] : rInfo.method
    httpVerb = httpVerb.toLowerCase()

    /*
    * path to resource
    */
    let path = rInfo.from ? rInfo.from.split(" ")[1] : rInfo.path

    /*
     * object#method to handle this endpoint
     * lets assume that you need have a controllers folder
     */
    let handler
    if(rInfo.to){
      let ctrlFileName = `${rInfo.to.split("#")[0]}-controller`
      let actionName = rInfo.to.split("#")[1]
      handler = require(`${controllersPath}/${ctrlFileName}`)[actionName]
    }else
      handler = require(`${controllersPath}/${decamelize(rInfo.controller, "-")}`)[rInfo.action]

    let endPoint = _.compact([ startMiddlewaresFor(rInfo), handler ])
    app[httpVerb](path, endPoint)
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

