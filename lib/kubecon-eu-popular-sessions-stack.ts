import * as cdk from '@aws-cdk/core';
import * as kubecon_service from '../lib/kubecon_service';

export class KubeconEuPopularSessionsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new kubecon_service.KubeConService(this, 'KubeConEuPopularSessions');
  }
}
