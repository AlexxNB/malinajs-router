// js/router.js
import storik2 from "storik";
var router = routerStore();
function routerStore() {
  let useHash = window.location.pathname === "srcdoc";
  const getLocation = () => {
    return useHash ? getLocationHash() : getLocationHistory();
  };
  const go = (href, set2) => {
    useHash ? window.location.hash = href : history.pushState({}, "", href);
    set2(getLocation());
  };
  const {subscribe, set} = storik2(getLocation(), () => {
    window.hashchange = window.onpopstate = () => set(getLocation());
    const removeListener = linkListener((href) => go(href, set));
    return () => {
      window.hashchange = window.onpopstate = null;
      removeListener();
    };
  });
  return {
    subscribe,
    goto: (href) => go(href, set),
    method: (method) => set(getLocation(useHash = method === "hash"))
  };
}
function getLocationHistory() {
  return {
    path: window.location.pathname,
    query: parseQuery(window.location.search.slice(1)),
    hash: window.location.hash.slice(1)
  };
}
function getLocationHash() {
  const match = String(window.location.hash.slice(1) || "/").match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);
  return {
    path: match[1] || "",
    query: parseQuery(match[2] || ""),
    hash: match[3] || ""
  };
}
function linkListener(go) {
  const h = (e) => {
    const a = e.target.closest("a[href]");
    if (a && /^\/$|^\/\w|^\/#\/\w/.test(a.getAttribute("href"))) {
      e.preventDefault();
      go(a.getAttribute("href").replace(/^\/#/, ""));
    }
  };
  addEventListener("click", h);
  return () => removeEventListener("click", h);
}
function parseQuery(str) {
  const o = str.split("&").map((p) => p.split("=")).reduce((r, p) => {
    const name = p[0];
    if (!name)
      return r;
    let value = p.length > 1 ? p[p.length - 1] : true;
    if (typeof value === "string" && value.includes(","))
      value = value.split(",");
    r[name] === void 0 ? r[name] = [value] : r[name].push(value);
    return r;
  }, {});
  return Object.entries(o).reduce((r, p) => (r[p[0]] = p[1].length > 1 ? p[1] : p[1][0], r), {});
}

// js/lib.js
import storik4 from "storik";
import {$context, $onDestroy, $tick} from "malinajs/runtime.js";
function createRouteObject(options) {
  const type = options.fallback ? "fallbacks" : "childs";
  const metaStore = storik4({});
  const meta = {
    url: "",
    query: "",
    params: {},
    subscribe: metaStore.subscribe
  };
  metaStore.set(meta);
  const route = {
    un: null,
    exact: false,
    pattern: "",
    parent: $context.parent,
    fallback: options.fallback,
    childs: new Set(),
    activeChilds: new Set(),
    fallbacks: new Set(),
    makePattern(path) {
      route.exact = !path.endsWith("/*");
      route.pattern = formatPath(`${route.parent && route.parent.pattern || ""}${path}`);
    },
    register: () => {
      if (!route.parent)
        return;
      route.parent[type].add(route);
      return () => {
        route.parent[type].delete(route);
        route.un && route.un();
      };
    },
    show: () => {
      options.onShow();
      !route.fallback && route.parent && route.parent.activeChilds.add(route);
    },
    hide: () => {
      options.onHide();
      !route.fallback && route.parent && route.parent.activeChilds.delete(route);
    },
    match: (url) => {
      const params = getParams(route.pattern, url);
      if (params && route.redirect && (!route.exact || params.exact && route.exact)) {
        return router.goto(route.redirect);
      }
      if (!route.fallback && params && (!route.exact || route.exact && params.exact)) {
        route.show();
        meta.params = params.params;
        metaStore.set(meta);
      } else {
        route.hide();
      }
      $tick(() => {
        if (params && route.childs.size > 0 && route.activeChilds.size == 0) {
          let obj = route;
          while (obj.fallbacks.size == 0) {
            obj = obj.parent;
            if (!obj)
              return;
          }
          obj && obj.fallbacks.forEach((fb) => fb.show());
        }
      });
    },
    meta
  };
  route.makePattern(options.path);
  route.un = router.subscribe((r) => {
    meta.url = r.path, meta.query = r.query, meta.params = {}, metaStore.set(meta);
    route.match(r.path);
  });
  $context.parent = route;
  $context.route = route.meta;
  $onDestroy(route.register());
  return route;
}
function getParams(pattern, path) {
  pattern = formatPath(pattern);
  path = formatPath(path);
  const keys = [];
  let params = {};
  let exact = true;
  let rx = pattern.split("/").map((s) => s.startsWith(":") ? (keys.push(s.slice(1)), "([^\\/]+)") : s).join("\\/");
  let match = path.match(new RegExp(`^${rx}$`));
  if (!match) {
    exact = false;
    match = path.match(new RegExp(`^${rx}`));
  }
  if (!match)
    return void 0;
  keys.forEach((key, i) => params[key] = match[i + 1]);
  return {exact, params};
}
function formatPath(path) {
  path = path.replace(/(^\/#)|(^\/\/#)|(^\/\/)|(\/\*$)|(\/$)/g, "");
  if (!path.startsWith("/"))
    path = "/" + path;
  return path;
}
export {
  createRouteObject,
  getParams,
  router
};
