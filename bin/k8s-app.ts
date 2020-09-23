#!/usr/bin/env node
import "source-map-support/register";

import { App } from "@aws-cdk/core";

import { K8sStack } from "../lib/app-stack";

const app = new App();
new K8sStack(app, "K8SOnAwsStack");
