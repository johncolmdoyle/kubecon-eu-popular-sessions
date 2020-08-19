import * as core from "@aws-cdk/core";
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as events from '@aws-cdk/aws-events';
import * as eventstargets from '@aws-cdk/aws-events-targets';

export class KubeConService extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'KubeConEu2020Sessions', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: {name: 'views', type: dynamodb.AttributeType.NUMBER }
    });

    const kubeconCookie = this.node.tryGetContext('kubecon_cookie');

    const consumeFunction = new lambda.Function(this, 'KubeConConsume', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'index.handler',
      code: lambda.Code.asset('./resources/consumer'),
      description: 'Query KubeCon APIs to get the latest data and insert into DynamoDB',
      timeout: core.Duration.seconds(30),
      environment: {
        DYNAMODB_TABLE: table.tableName,
        KUBECON_COOKIE: kubeconCookie
      },
    });

    const lambdaTarget = new eventstargets.LambdaFunction(consumeFunction);

    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '1' }),
      targets: [lambdaTarget],
    });

    const listFunction = new lambda.Function(this, 'KubeConList', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'index.list',
      code: lambda.Code.asset('./resources/api'),
      description: 'Used by the API Gateway to return the data.',
      environment: {
        DYNAMODB_TABLE: table.tableName
      },
    });

    table.grantWriteData(consumeFunction);
    table.grantReadData(listFunction);

    const api = new apigateway.RestApi(this, "kubeconvides-api", {
      restApiName: "KubeCon Vibes",
      description: "This service to access the kubecon data.",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS
      }
    });

    const getIntegration = new apigateway.LambdaIntegration(listFunction, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", getIntegration);

    const domainName = 'kubeconvibes.com'

    const zone = route53.HostedZone.fromLookup(this, 'KubeConZone', {
      domainName: domainName
    });

    const cert = new acm.Certificate(this, 'Certificate', {
      domainName: 'api.' + domainName,
      validation: acm.CertificateValidation.fromDns(zone)
    });

    // First create a custom domain:
    const customDomain = new apigateway.DomainName(this, 'customDomain', {
      domainName: 'api.' + domainName,
      certificate: cert,
      endpointType: apigateway.EndpointType.EDGE
    });

    new apigateway.BasePathMapping(this, 'CustomBasePathMapping', {
      domainName: customDomain,
      restApi: api
    });

    new route53.CnameRecord(this, 'ApiGatewayRecordSet', {
      zone: zone,
      recordName: 'api',
      domainName: customDomain.domainNameAliasDomainName
    });

    const sourceBucket = new s3.Bucket(this, 'frontendBucket', {
      websiteIndexDocument: 'index.html',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED
    });    

    new s3deploy.BucketDeployment(this, 'deployWebsite', {
      sources: [s3deploy.Source.asset('frontend/build/')],
      destinationBucket: sourceBucket
    });

    const oia = new cloudfront.OriginAccessIdentity(this, 'OIA', {
      comment: "Created by CDK"
    });
    sourceBucket.grantRead(oia);

    const cloudfrontCert = new acm.Certificate(this, 'CloudfrontCertificate', {
      domainName: domainName,
      subjectAlternativeNames: ['www.' + domainName],
      validation: acm.CertificateValidation.fromDns(zone)
    });

    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'frontendCloudfront', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: sourceBucket,
            originAccessIdentity: oia
          },
          behaviors : [ {isDefaultBehavior: true}]
        }
      ],
      aliasConfiguration: {
        acmCertRef: cloudfrontCert.certificateArn,
        names: [domainName, 'www.' + domainName]
      }
    });

    new route53.ARecord(this, 'CloudfrontAlias', {
      zone: zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });

    new route53.ARecord(this, 'CloudfrontWWWAlias', {
      recordName: 'www',
      zone: zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });
  }
}
