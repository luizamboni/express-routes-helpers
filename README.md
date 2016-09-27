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
      path: "/exercicio-resolvidos/:slug/:id/pagina/:page",
      controller: "TagsController",
      action: "show"
    },
    { from: "GET /disciplina/:slug/tag", to: "tags#show"  },
    { method: "GET",
      path: "/",
      controller: "PagesController",
      action: "welcome"
    }
  ]
}
```

## init in express
```javascript
const ExpressRoutesHelper = require("express-routes-helper")

let expressRoutesHelper = new ExpressRoutesHelper(app)
expressRoutesHelper.build(config)

```
