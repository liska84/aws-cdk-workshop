
// Cleaning the sample code
// import { Duration, Stack, StackProps } from 'aws-cdk-lib';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
// import { Construct } from 'constructs';

// export class CdkWorkshopStack extends Stack {
//   constructor(scope: Construct, id: string, props?: StackProps) {
//     super(scope, id, props);

//     const queue = new sqs.Queue(this, 'CdkWorkshopQueue', {
//       visibilityTimeout: Duration.seconds(300)
//     });

//     const topic = new sns.Topic(this, 'CdkWorkshopTopic');

//     topic.addSubscription(new subs.SqsSubscription(queue));
//   }
// }

// Lambda example
// import * as cdk from 'aws-cdk-lib';
// import * as lambda from 'aws-cdk-lib/aws-lambda';

// export class CdkWorkshopStack extends cdk.Stack {
//   constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);
    
//     // Define AWS Lambda resource
//     const hello = new lambda.Function(this, 'HelloHandler', {
//       runtime: lambda.Runtime.NODEJS_16_X, // exec env
//       code: lambda.Code.fromAsset('lambda'), // code loaded from "lambda" dir
//       handler: 'hello.handler' // file is "hello", func is "handler"
//     });
//   }
// }

//API Gateway + Lambda
import * as cdk from 'aws-cdk-lib';
import* as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda 
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime:lambda.Runtime.NODEJS_16_X, // exec env
      code:lambda.Code.fromAsset('lambda'), // code loader from "lambda" dir
      handler: 'hello.handler' // file is "hello", func is "handler"
    });

    // API Gateway REST API resource backed by "hello" function
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: hello
    });
  }
}