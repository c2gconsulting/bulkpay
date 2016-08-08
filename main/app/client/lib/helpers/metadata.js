/**
 * Core MetaData
 * Spiderable method to set meta tags for crawl
 * accepts current iron-router route
 */
Core.MetaData = {
  settings: {
    title: "",
    meta: [],
    ignore: ["viewport", "fragment"]
  },
  render: function () {
    let metaContent = Blaze.toHTMLWithData(Template.coreHead, Router.current().getName);
    $("head").append(metaContent);
    return metaContent;
  },
  clear: function () {
    $("title").remove();
    let metaElements = $("meta").toArray();
    let _results = [];
    for (let meta of metaElements) {
      $metaTag = $(meta);
      let property = $metaTag.attr("name") || $metaTag.attr("property");
      if (property && _.indexOf(Core.MetaData.settings.ignore, property) < 0) {
        _results.push($metaTag.remove());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  },
  update: function (route, params, updateMeta) {
    if (!Router.current()) {
      return false;
    }
    let product = selectedProduct();
    let tenant = Tenants.findOne(Core.getTenantId());
    let meta = updateMeta || [];
    let title = "";
    let keywords = [];

    if (tenant) {
      Core.MetaData.name = tenant.name;
      if (params._id) {
        title = params._id.charAt(0).toUpperCase() + params._id.substring(1);
      } else {
        routeName = Router.current().route.getName();
        title = routeName.charAt(0).toUpperCase() + routeName.substring(1);
      }
      if (product && product.handle === params._id && product.handle) {
        if (product !== null ? product.description : void 0) {
          meta.push({
            name: "description",
            content: product.description
          });
        }
        if (product !== null ? product.metafields : void 0) {
          for (let key of product.metafields) {
            keywords.push(key.value);
          }
        }

        if (keywords) {
          meta.push({
            name: "keywords",
            content: keywords.toString()
          });
        }

        if (product !== null ? product.title : void 0) {
          title = product.title;
        }
      } else {
        if (tenant !== null ? tenant.description : void 0) {
          meta.push({
            description: tenant.description
          });
        }
        if (tenant !== null ? tenant.keywords : void 0) {
          meta.push({
            keywords: tenant.keywords
          });
        }
      }
      // set site defaults
      Core.MetaData.title = title;
      Core.MetaData.meta = meta;
      return meta;
    }
  },
  refresh: function (route, params, meta) {
    Core.MetaData.clear(route);
    Core.MetaData.update(route, params, meta);
    return Core.MetaData.render(route);
  }
};
