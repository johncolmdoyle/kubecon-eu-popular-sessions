#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { KubeconEuPopularSessionsStack } from '../lib/kubecon-eu-popular-sessions-stack';

const envUSA = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const app = new cdk.App();
new KubeconEuPopularSessionsStack(app, 'KubeconEuPopularSessionsStack', {env: envUSA});
