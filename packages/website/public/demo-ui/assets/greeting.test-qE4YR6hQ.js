import { f as e, g as t, l as n, m as r, p as i, v as a } from "./src-CL-PUynl.js";
a(`./greeting`, () => ({ getGreeting: (e) => `Good morning, ${e}!` }));
var { getGreeting: o } = await t(`./greeting`, () =>
  n(() => import(`./greeting-BZEmeHNQ.js`), [], import.meta.url),
);
i(`getGreeting() — mocked`, () => {
  (r(`returns the mocked greeting`, () => {
    e(o(`Alice`)).toBe(`Good morning, Alice!`);
  }),
    r(`passes the name through the mock`, () => {
      e(o(`Bob`)).toBe(`Good morning, Bob!`);
    }));
});
//# sourceMappingURL=greeting.test-qE4YR6hQ.js.map
