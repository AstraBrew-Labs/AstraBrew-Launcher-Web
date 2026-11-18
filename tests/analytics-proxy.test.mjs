import { expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "../proxy.ts";

for (const path of ["/_vercel/insights/script.js", "/_vercel/insights/view", "/cdn-cgi/rum"]) {
  test(`${path} bypasses locale redirects`, () => {
    const response = proxy(new NextRequest(`https://launcher.astrabrew.cn${path}`));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
}
