import * as cdk from 'aws-cdk-lib';
import* as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import { Construct } from 'constructs';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda 
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime:lambda.Runtime.NODEJS_16_X, // exec env
      code:lambda.Code.fromAsset('lambda'), // code loader from "lambda" dir
      handler: 'hello.handler' // file is "hello", func is "handler"
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    // API Gateway REST API resource backed by our "hello" function
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });

    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello hits',
      table: helloWithCounter.table
    });

  }
}