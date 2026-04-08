const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./browser-CYfZNVUj.js",
      "./isCommonAssetRequest-Bwl7cir4.js",
      "./core-CKfPV5fn.js",
      "./core-CtCGWKBk.js",
      "./src-D-XDP5ja.js",
      "./src-CL-PUynl.js",
      "./chunk-DECur_0Z.js",
      "./axe-CftruGSC.js",
      "./client-DsoX8Bqk.js",
      "./react-BpVXNi5D.js",
      "./jsx-runtime-BSbMHKsn.js",
      "./NetworkTab-NB4GXuqP.js",
    ]),
) => i.map((i) => d[i]);
import { d as e, l as t, u as n, y as r } from "./src-CL-PUynl.js";
var i = !(typeof process < `u` && typeof process.versions?.node == `string`),
  a = typeof window < `u` && window.name === `__vt_sandbox`,
  o = typeof window < `u` && window.name === `__vt_display`,
  s = new Map();
async function c(e, t, n) {
  let r = s.get(e);
  if ((s.delete(e), !r || !r.test)) return;
  let i;
  try {
    i = (await t.clone().text()) || void 0;
  } catch {}
  let a = {
    method: r.method,
    url: r.url,
    status: t.status,
    mocked: n,
    requestBody: r.requestBody,
    responseBody: i,
    duration: Date.now() - r.t0,
    timestamp: r.t0,
  };
  (r.test.networkEntries || (r.test.networkEntries = []), r.test.networkEntries.push(a));
}
var l;
if (i && a) {
  let { setupWorker: e } = await t(
      async () => {
        let { setupWorker: e } = await import(`./browser-CYfZNVUj.js`);
        return { setupWorker: e };
      },
      __vite__mapDeps([0, 1]),
      import.meta.url,
    ),
    { http: n, HttpResponse: i } = await t(
      async () => {
        let { http: e, HttpResponse: t } = await import(`./core-CKfPV5fn.js`);
        return { http: e, HttpResponse: t };
      },
      __vite__mapDeps([2, 1, 3]),
      import.meta.url,
    ),
    a = e(
      n.get(`/__fieldtest_source__`, () => new i(null, { status: 404 })),
      n.get(`/__fieldtest_files__`, () => i.json([])),
      n.get(`/__fieldtest_graph__`, () => i.json({ nodes: [], edges: [] })),
    );
  try {
    await a.start({
      serviceWorker: { url: `./mockServiceWorker.js` },
      onUnhandledRequest: `bypass`,
      quiet: !0,
    });
  } catch (e) {
    console.warn("[MSW] Failed to start service worker. Run `npx msw init ./public` to fix.", e);
  }
  (a.events.on(`*`, async (e) => {
    let { type: t, requestId: n, request: i, response: a } = e;
    if (n) {
      if (t === `request:start` && i) {
        if (!r) return;
        s.set(n, { t0: Date.now(), method: i.method, url: i.url, test: r });
        try {
          let e = await i.clone().text(),
            t = s.get(n);
          t && e && (t.requestBody = e);
        } catch {}
        return;
      }
      (t === `response:mocked` || t === `response:bypass`) &&
        a &&
        (await c(n, a, t === `response:mocked`));
    }
  }),
    (l = a));
  let { registerTab: o } = await t(
      async () => {
        let { registerTab: e } = await import(`./src-D-XDP5ja.js`);
        return { registerTab: e };
      },
      __vite__mapDeps([4, 5, 6, 7, 8, 9, 10]),
      import.meta.url,
    ),
    { NetworkTab: u } = await t(
      async () => {
        let { NetworkTab: e } = await import(`./NetworkTab-NB4GXuqP.js`);
        return { NetworkTab: e };
      },
      __vite__mapDeps([11, 6, 10, 9]),
      import.meta.url,
    );
  o({
    id: `network`,
    label: `Network`,
    getCount: (e) => e.networkEntries.length || void 0,
    component: u,
  });
} else if (i && o) {
  let n = [],
    { getResponse: r } = await t(
      async () => {
        let { getResponse: e } = await import(`./core-CKfPV5fn.js`);
        return { getResponse: e };
      },
      __vite__mapDeps([2, 1, 3]),
      import.meta.url,
    ),
    i = window.fetch.bind(window);
  ((window.fetch = async (e, t) => (await r(n, new Request(e, t))) || i(e, t)),
    e(() => {
      n.length = 0;
    }),
    (l = {
      use(...e) {
        n.push(...e);
      },
      resetHandlers() {
        n.length = 0;
      },
    }));
} else if (!i) {
  let { setupServer: e } = await t(
      async () => {
        let { setupServer: e } = await import(`msw/node`);
        return { setupServer: e };
      },
      [],
      import.meta.url,
    ),
    n = e();
  (n.listen({ onUnhandledRequest: `bypass` }),
    n.events.on(`*`, async (e) => {
      let { type: t, requestId: n, request: i, response: a } = e;
      if (n) {
        if (t === `request:start` && i) {
          if (!r) return;
          s.set(n, { t0: Date.now(), method: i.method, url: i.url, test: r });
          try {
            let e = await i.clone().text(),
              t = s.get(n);
            t && e && (t.requestBody = e);
          } catch {}
          return;
        }
        (t === `response:mocked` || t === `response:bypass`) &&
          a &&
          (await c(n, a, t === `response:mocked`));
      }
    }),
    (l = n));
}
n(() => l?.resetHandlers());
var u = l ?? { use() {}, resetHandlers() {} };
export { u as t };
//# sourceMappingURL=setup-BE8OUKUT.js.map
