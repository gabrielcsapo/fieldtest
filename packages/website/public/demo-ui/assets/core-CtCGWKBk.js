import {
  _ as e,
  c as t,
  f as n,
  g as r,
  l as i,
  m as a,
  n as o,
  p as s,
  s as c,
  u as l,
} from "./isCommonAssetRequest-Bwl7cir4.js";
function u() {
  e(
    typeof URL < `u`,
    r.formatMessage(
      `Global "URL" class is not defined. This likely means that you're running MSW in an environment that doesn't support all Node.js standard API (e.g. React Native). If that's the case, please use an appropriate polyfill for the "URL" class, like "react-native-url-polyfill".`,
    ),
  );
}
function d(e, t) {
  return e.toLowerCase() === t.toLowerCase();
}
function f(e) {
  return e < 300 ? `#69AB32` : e < 400 ? `#F0BB4B` : `#E95F5D`;
}
function p(e) {
  let t = new Date(),
    n = `${t.getHours().toString().padStart(2, `0`)}:${t.getMinutes().toString().padStart(2, `0`)}:${t.getSeconds().toString().padStart(2, `0`)}`;
  return e?.milliseconds ? `${n}.${t.getMilliseconds().toString().padStart(3, `0`)}` : n;
}
async function m(e) {
  let t = await e.clone().text();
  return {
    url: new URL(e.url),
    method: e.method,
    headers: Object.fromEntries(e.headers.entries()),
    body: t,
  };
}
var { message: h } = s;
async function g(e) {
  let t = e.clone(),
    n = await t.text(),
    r = t.status || 200;
  return {
    status: r,
    statusText: t.statusText || h[r] || `OK`,
    headers: Object.fromEntries(t.headers.entries()),
    body: n,
  };
}
var _ = Object.create,
  v = Object.defineProperty,
  y = Object.getOwnPropertyDescriptor,
  b = Object.getOwnPropertyNames,
  x = Object.getPrototypeOf,
  S = Object.prototype.hasOwnProperty,
  C = (e, t) =>
    function () {
      return (t || (0, e[b(e)[0]])((t = { exports: {} }).exports, t), t.exports);
    },
  w = (e, t, n, r) => {
    if ((t && typeof t == `object`) || typeof t == `function`)
      for (let i of b(t))
        !S.call(e, i) &&
          i !== n &&
          v(e, i, { get: () => t[i], enumerable: !(r = y(t, i)) || r.enumerable });
    return e;
  },
  T = ((e, t, n) => (
    (n = e == null ? {} : _(x(e))),
    w(t || !e || !e.__esModule ? v(n, `default`, { value: e, enumerable: !0 }) : n, e)
  ))(
    C({
      "node_modules/.pnpm/cookie@1.0.2/node_modules/cookie/dist/index.js"(e) {
        (Object.defineProperty(e, `__esModule`, { value: !0 }), (e.parse = s), (e.serialize = u));
        var t = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/,
          n = /^[\u0021-\u003A\u003C-\u007E]*$/,
          r = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i,
          i = /^[\u0020-\u003A\u003D-\u007E]*$/,
          a = Object.prototype.toString,
          o = (() => {
            let e = function () {};
            return ((e.prototype = Object.create(null)), e);
          })();
        function s(e, t) {
          let n = new o(),
            r = e.length;
          if (r < 2) return n;
          let i = t?.decode || d,
            a = 0;
          do {
            let t = e.indexOf(`=`, a);
            if (t === -1) break;
            let o = e.indexOf(`;`, a),
              s = o === -1 ? r : o;
            if (t > s) {
              a = e.lastIndexOf(`;`, t - 1) + 1;
              continue;
            }
            let u = c(e, a, t),
              d = l(e, t, u),
              f = e.slice(u, d);
            if (n[f] === void 0) {
              let r = c(e, t + 1, s),
                a = l(e, s, r);
              n[f] = i(e.slice(r, a));
            }
            a = s + 1;
          } while (a < r);
          return n;
        }
        function c(e, t, n) {
          do {
            let n = e.charCodeAt(t);
            if (n !== 32 && n !== 9) return t;
          } while (++t < n);
          return n;
        }
        function l(e, t, n) {
          for (; t > n; ) {
            let n = e.charCodeAt(--t);
            if (n !== 32 && n !== 9) return t + 1;
          }
          return n;
        }
        function u(e, a, o) {
          let s = o?.encode || encodeURIComponent;
          if (!t.test(e)) throw TypeError(`argument name is invalid: ${e}`);
          let c = s(a);
          if (!n.test(c)) throw TypeError(`argument val is invalid: ${a}`);
          let l = e + `=` + c;
          if (!o) return l;
          if (o.maxAge !== void 0) {
            if (!Number.isInteger(o.maxAge))
              throw TypeError(`option maxAge is invalid: ${o.maxAge}`);
            l += `; Max-Age=` + o.maxAge;
          }
          if (o.domain) {
            if (!r.test(o.domain)) throw TypeError(`option domain is invalid: ${o.domain}`);
            l += `; Domain=` + o.domain;
          }
          if (o.path) {
            if (!i.test(o.path)) throw TypeError(`option path is invalid: ${o.path}`);
            l += `; Path=` + o.path;
          }
          if (o.expires) {
            if (!f(o.expires) || !Number.isFinite(o.expires.valueOf()))
              throw TypeError(`option expires is invalid: ${o.expires}`);
            l += `; Expires=` + o.expires.toUTCString();
          }
          if (
            (o.httpOnly && (l += `; HttpOnly`),
            o.secure && (l += `; Secure`),
            o.partitioned && (l += `; Partitioned`),
            o.priority)
          )
            switch (typeof o.priority == `string` ? o.priority.toLowerCase() : void 0) {
              case `low`:
                l += `; Priority=Low`;
                break;
              case `medium`:
                l += `; Priority=Medium`;
                break;
              case `high`:
                l += `; Priority=High`;
                break;
              default:
                throw TypeError(`option priority is invalid: ${o.priority}`);
            }
          if (o.sameSite)
            switch (typeof o.sameSite == `string` ? o.sameSite.toLowerCase() : o.sameSite) {
              case !0:
              case `strict`:
                l += `; SameSite=Strict`;
                break;
              case `lax`:
                l += `; SameSite=Lax`;
                break;
              case `none`:
                l += `; SameSite=None`;
                break;
              default:
                throw TypeError(`option sameSite is invalid: ${o.sameSite}`);
            }
          return l;
        }
        function d(e) {
          if (e.indexOf(`%`) === -1) return e;
          try {
            return decodeURIComponent(e);
          } catch {
            return e;
          }
        }
        function f(e) {
          return a.call(e) === `[object Date]`;
        }
      },
    })(),
    1,
  ),
  E = T.default || T,
  D = E.parse,
  O = E.serialize;
function k(e) {
  let t = D(e),
    n = {};
  for (let e in t) t[e] !== void 0 && (n[e] = t[e]);
  return n;
}
function A() {
  return k(document.cookie);
}
function j(e) {
  if (typeof document > `u` || typeof location > `u`) return {};
  switch (e.credentials) {
    case `same-origin`: {
      let t = new URL(e.url);
      return location.origin === t.origin ? A() : {};
    }
    case `include`:
      return A();
    default:
      return {};
  }
}
function M(e) {
  let t = e.headers.get(`cookie`),
    n = t ? k(t) : {},
    r = j(e);
  for (let t in r) e.headers.append(`cookie`, O(t, r[t]));
  let i = c.getCookies(e.url),
    a = Object.fromEntries(i.map((e) => [e.key, e.value]));
  for (let t of i) e.headers.append(`cookie`, t.toString());
  return { ...r, ...a, ...n };
}
var N = ((e) => (
    (e.HEAD = `HEAD`),
    (e.GET = `GET`),
    (e.POST = `POST`),
    (e.PUT = `PUT`),
    (e.PATCH = `PATCH`),
    (e.OPTIONS = `OPTIONS`),
    (e.DELETE = `DELETE`),
    e
  ))(N || {}),
  P = class extends a {
    constructor(e, t, n, r) {
      let i = typeof t == `function` ? `[custom predicate]` : t;
      (super({
        info: { header: `${e}${i ? ` ${i}` : ``}`, path: t, method: e },
        resolver: n,
        options: r,
      }),
        this.checkRedundantQueryParameters());
    }
    checkRedundantQueryParameters() {
      let { method: e, path: t } = this.info;
      !t ||
        t instanceof RegExp ||
        typeof t == `function` ||
        (l(t) !== t &&
          r.warn(
            `Found a redundant usage of query parameters in the request handler URL for "${e} ${t}". Please match against a path instead and access query parameters using "new URL(request.url).searchParams" instead. Learn more: https://mswjs.io/docs/http/intercepting-requests#querysearch-parameters`,
          ));
    }
    async parse(e) {
      let t = new URL(e.request.url),
        n = M(e.request);
      if (typeof this.info.path == `function`) {
        let t = await this.info.path({ request: e.request, cookies: n });
        return { match: typeof t == `boolean` ? { matches: t, params: {} } : t, cookies: n };
      }
      return {
        match: this.info.path
          ? i(t, this.info.path, e.resolutionContext?.baseUrl)
          : { matches: !1, params: {} },
        cookies: n,
      };
    }
    async predicate(e) {
      let t = this.matchMethod(e.request.method),
        n = e.parsedResult.match.matches;
      return t && n;
    }
    matchMethod(e) {
      return this.info.method instanceof RegExp ? this.info.method.test(e) : d(this.info.method, e);
    }
    extendResolverArgs(e) {
      return { params: e.parsedResult.match?.params || {}, cookies: e.parsedResult.cookies };
    }
    async log(e) {
      let n = t(e.request.url),
        i = await m(e.request),
        a = await g(e.response),
        o = f(a.status);
      (console.groupCollapsed(
        r.formatMessage(`${p()} ${e.request.method} ${n} (%c${a.status} ${a.statusText}%c)`),
        `color:${o}`,
        `color:inherit`,
      ),
        console.log(`Request`, i),
        console.log(`Handler:`, this),
        console.log(`Response`, a),
        console.groupEnd());
    }
  };
function F(e) {
  return (t, n, r = {}) => new P(e, t, n, r);
}
var I = {
    all: F(/.+/),
    head: F(N.HEAD),
    get: F(N.GET),
    post: F(N.POST),
    put: F(N.PUT),
    delete: F(N.DELETE),
    patch: F(N.PATCH),
    options: F(N.OPTIONS),
  },
  L = async (e, t, r) =>
    (await o({ request: t, requestId: n(), handlers: e, resolutionContext: r }))?.response;
u();
export { N as i, I as n, P as r, L as t };
//# sourceMappingURL=core-CtCGWKBk.js.map
