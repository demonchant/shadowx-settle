import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";

describe("shadowx-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("placeholder integration test", async () => {
    // After `anchor build`, real tests using the generated IDL go here.
    assert.ok(true);
  });
});
