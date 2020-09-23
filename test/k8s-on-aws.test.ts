import {
  expect as expectCDK,
  MatchStyle,
  matchTemplate,
} from "@aws-cdk/assert";
import { App } from "@aws-cdk/core";

import { K8sStack } from "../lib/app-stack";

test("Empty Stack", () => {
  const app = new App();
  // WHEN
  const stack = new K8sStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
