import { f as e, g as t, l as n, m as r, p as i, v as a } from "./src-CL-PUynl.js";
a(`./discounts`, () => ({
  noDiscount: (e, t) => e * t,
  bulkDiscount: (e, t) => e * t * 0.5,
  memberDiscount: (e, t) => e * t * 0.7,
}));
var { calculateTotal: o } = await t(`./cart`, () =>
    n(() => import(`./cart-BHhd4o8o.js`), [], import.meta.url),
  ),
  { bulkDiscount: s, memberDiscount: c } = await t(`./discounts`, () =>
    n(() => import(`./discounts-BwrQrsj-.js`), [], import.meta.url),
  ),
  l = [
    { name: `Widget`, price: 10, qty: 2 },
    { name: `Gadget`, price: 25, qty: 1 },
    { name: `Doohickey`, price: 5, qty: 5 },
  ];
i(`calculateTotal() with mocked discount strategies`, () => {
  (r(`calls bulkDiscount once per line item and sums the results`, () => {
    e(o(l, s)).toBe(35);
  }),
    r(`calls memberDiscount once per line item and sums the results`, () => {
      e(o(l, c)).toBe(49);
    }),
    r(`passes price and qty as separate args — not the whole item object`, () => {
      (o([{ name: `Solo`, price: 99, qty: 3 }], s), e(!0).toBe(!0));
    }));
});
//# sourceMappingURL=discounts.test-Cuezdb-T.js.map
