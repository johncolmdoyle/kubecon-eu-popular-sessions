import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as KubeconEuPopularSessions from '../lib/kubecon-eu-popular-sessions-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new KubeconEuPopularSessions.KubeconEuPopularSessionsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
