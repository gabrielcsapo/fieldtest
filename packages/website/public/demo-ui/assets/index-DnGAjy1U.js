const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./Button.test-CjIpudJ1.js",
      "./src-CL-PUynl.js",
      "./chunk-DECur_0Z.js",
      "./axe-CftruGSC.js",
      "./client-DsoX8Bqk.js",
      "./react-BpVXNi5D.js",
      "./jsx-runtime-BSbMHKsn.js",
      "./Button-DKnzWxx7.js",
      "./Card.test-Mz_3ccsy.js",
      "./Card-BdJMjhXl.js",
      "./Counter.test-CLREswd_.js",
      "./DisableOnClickButton.test-BRxL2loH.js",
      "./TaskBoard.test-DdWvmkhQ.js",
      "./UserProfile.test-rpW_rVDz.js",
      "./setup-BE8OUKUT.js",
      "./isCommonAssetRequest-Bwl7cir4.js",
      "./core-CtCGWKBk.js",
      "./discounts.test-Cuezdb-T.js",
      "./greeting.test-qE4YR6hQ.js",
      "./logic.test-mdIovDdg.js",
    ]),
) => i.map((i) => d[i]);
import { l as e, t } from "./src-CL-PUynl.js";
import { t as n } from "./jsx-runtime-BSbMHKsn.js";
import "./setup-BE8OUKUT.js";
(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes) e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      e.crossOrigin === `use-credentials`
        ? (t.credentials = `include`)
        : e.crossOrigin === `anonymous`
          ? (t.credentials = `omit`)
          : (t.credentials = `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var r = n();
function i({ children: e }) {
  return (0, r.jsx)(`div`, { style: { fontFamily: `inherit`, color: `inherit` }, children: e });
}
await t(
  Object.assign({
    "./src/Button.test.tsx": () =>
      e(
        () => import(`./Button.test-CjIpudJ1.js`),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7]),
        import.meta.url,
      ),
    "./src/Card.test.tsx": () =>
      e(
        () => import(`./Card.test-Mz_3ccsy.js`),
        __vite__mapDeps([8, 1, 2, 3, 4, 5, 6, 9, 7]),
        import.meta.url,
      ),
    "./src/Counter.test.tsx": () =>
      e(
        () => import(`./Counter.test-CLREswd_.js`),
        __vite__mapDeps([10, 2, 1, 3, 4, 5, 6]),
        import.meta.url,
      ),
    "./src/DisableOnClickButton.test.tsx": () =>
      e(
        () => import(`./DisableOnClickButton.test-BRxL2loH.js`),
        __vite__mapDeps([11, 2, 1, 3, 4, 5, 6]),
        import.meta.url,
      ),
    "./src/TaskBoard.test.tsx": () =>
      e(
        () => import(`./TaskBoard.test-DdWvmkhQ.js`),
        __vite__mapDeps([12, 2, 1, 3, 4, 5, 6, 7, 9]),
        import.meta.url,
      ),
    "./src/UserProfile.test.tsx": () =>
      e(
        () => import(`./UserProfile.test-rpW_rVDz.js`),
        __vite__mapDeps([13, 2, 1, 3, 4, 5, 6, 14, 15, 16]),
        import.meta.url,
      ),
    "./src/discounts.test.ts": () =>
      e(
        () => import(`./discounts.test-Cuezdb-T.js`),
        __vite__mapDeps([17, 1, 2, 3, 4, 5, 6]),
        import.meta.url,
      ),
    "./src/greeting.test.ts": () =>
      e(
        () => import(`./greeting.test-qE4YR6hQ.js`),
        __vite__mapDeps([18, 1, 2, 3, 4, 5, 6]),
        import.meta.url,
      ),
    "./src/logic.test.ts": () =>
      e(
        () => import(`./logic.test-mdIovDdg.js`),
        __vite__mapDeps([19, 1, 2, 3, 4, 5, 6]),
        import.meta.url,
      ),
  }),
  { wrapper: i },
);
//# sourceMappingURL=index-DnGAjy1U.js.map
