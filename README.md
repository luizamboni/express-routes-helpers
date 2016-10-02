ExpressRoutesHelper
===

# get started
## make a config file
```javascript
module.exports = {
  host: "//www.yourdomain.com",
  debug: true,
  routes: [
    { from: "GET /page/:slug/:id", to: "pages#show" },
    { method: "GET",
      path: "/",
      controller: "PagesController",
      action: "welcome"
    }
  ]
}
```
## route parameters
use **to** key to specify a pair **controller#method**.

use **from** to specify a pair **http verb** (or any express route method) and **path**
```javascript
/* Example
* this will set get path with pattern ""/page/:slug/:id"
* use module exported in controllers/pages-controller.js
* in method show(req, res)
*/
{ from: "GET /page/:slug/:id", to: "pages#show" },
```

use **as** key to overwrite a function name
```javascript
{ from: "GET /page/:slug/:id", to: "pages#show", as: "myCustomName" },
```
it will generate a method `myCustomNameUrl({url , id})` instead `pagesShowUrl({url , id})`


## init in express
```javascript
const ExpressRoutesHelper = require("express-routes-helper")

let expressRoutesHelper = new ExpressRoutesHelper(app)
expressRoutesHelper.build(config)

```

# ChangeLogs
- `2016-10-02` added support to **as** parameter in config route name function
