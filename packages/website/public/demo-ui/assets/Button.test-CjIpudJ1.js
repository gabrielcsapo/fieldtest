import { f as e, m as t, o as n, p as r, s as i } from "./src-CL-PUynl.js";
import { t as a } from "./jsx-runtime-BSbMHKsn.js";
import { t as o } from "./Button-DKnzWxx7.js";
var s = a();
r(`Button`, () => {
  (t(`renders the label`, async () => {
    let { getByText: t } = await i((0, s.jsx)(o, { label: `Click me` }));
    e(t(`Click me`)).toBeTruthy();
  }),
    t(`primary variant (default)`, async () => {
      await i((0, s.jsx)(o, { label: `Primary` }));
    }),
    t(`secondary variant`, async () => {
      await i((0, s.jsx)(o, { label: `Secondary`, variant: `secondary` }));
    }),
    t(`danger variant`, async () => {
      await i((0, s.jsx)(o, { label: `Delete`, variant: `danger` }));
    }),
    t(`disabled state`, async () => {
      let { getByRole: t } = await i((0, s.jsx)(o, { label: `Can't touch this`, disabled: !0 }));
      e(t(`button`).hasAttribute(`disabled`)).toBeTruthy();
    }),
    t(`fires onClick when clicked`, async () => {
      let t = !1,
        { getByRole: r } = await i(
          (0, s.jsx)(o, {
            label: `Click me`,
            onClick: () => {
              t = !0;
            },
          }),
        );
      (await n.click(r(`button`)), e(t).toBe(!0));
    }),
    t(`wrong label`, async () => {
      let { getByRole: t } = await i((0, s.jsx)(o, { label: `Submit` }));
      e(t(`button`).textContent).toBe(`Save`);
    }),
    t(`all variants`, async () => {
      (await i((0, s.jsx)(o, { label: `Primary` })),
        await i((0, s.jsx)(o, { label: `Secondary`, variant: `secondary` })),
        await i((0, s.jsx)(o, { label: `Danger`, variant: `danger` })),
        await i((0, s.jsx)(o, { label: `Disabled`, disabled: !0 })));
    }));
});
//# sourceMappingURL=Button.test-CjIpudJ1.js.map
