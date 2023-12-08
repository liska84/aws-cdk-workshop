# AWS CDK

<aside>
💡 **AWS CDK v1 has reached End-of-Support on 2023-06-01. This package is no longer being updated, and users should migrate to AWS CDK v2**

</aside>

[https://cdkworkshop.com/20-typescript.html](https://cdkworkshop.com/20-typescript.html)

```bash
mkdir cdk-workshop && cdk-workshop
npm -g install typescript
aws --version
aws configure
npm install -g aws-cdk
cdk --version
cdk init sample-app --language typescript
...
Applying project template sample-app for typescript
# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

Initializing a new git repository...
Executing npm install...
✅ All done!
```

# Explore your project directory

You’ll see something like this:

![https://cdkworkshop.com/20-typescript/20-create-project/structure.png](https://cdkworkshop.com/20-typescript/20-create-project/structure.png)

- `lib/cdk-workshop-stack.ts` is where your CDK application’s main stack is defined. This is the file we’ll be spending most of our time in.
- `bin/cdk-workshop.ts` is the entrypoint of the CDK application. It will load the stack defined in `lib/cdk-workshop-stack.ts`.
- `package.json` is your npm module manifest. It includes information like the name of your app, version, dependencies and build scripts like “watch” and “build” (`package-lock.json` is maintained by npm)
- `cdk.json` tells the toolkit how to run your app. In our case it will be `"npx ts-node bin/cdk-workshop.ts"`
- `tsconfig.json` your project’s [typescript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- `.gitignore` and `.npmignore` tell git and npm which files to include/exclude from source control and when publishing this module to the package manager.
- `node_modules` is maintained by npm and includes all your project’s dependencies.

### Your app’s entry point

```tsx
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkWorkshopStack');
```

This code loads and instantiates the `CdkWorkshopStack` class from the `lib/cdk-workshop-stack.ts` file. We won’t need to look at this file anymore.

### The main stack

Open up `lib/cdk-workshop-stack.ts`. This is where the meat of our application is:

```tsx
import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkWorkshopQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'CdkWorkshopTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
```

As you can see, our app was created with a sample CDK stack (`CdkWorkshopStack`).

The stack includes:

- SQS Queue (`new sqs.Queue`)
- SNS Topic (`new sns.Topic`)
- Subscribes the queue to receive any messages published to the topic (`topic.addSubscription`)

# Synthesize a template from your app

AWS CDK apps are effectively only a **definition** of your infrastructure using code. When CDK apps are executed, they produce (or “**synthesize**”, in CDK parlance) an AWS CloudFormation template for each stack defined in your application.

To synthesize a CDK app, use the `cdk synth` command. Let’s check out the template synthesized from the sample app:

```tsx
cdk synth

Resources:
  CdkWorkshopQueue50D9D426:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 300
    UpdateReplacePolicy: Delete
    DeletionPolicy: Delete
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopQueue/Resource
  CdkWorkshopQueuePolicyAF2494A5:
    Type: AWS::SQS::QueuePolicy
    Properties:
      PolicyDocument:
        Statement:
          - Action: sqs:SendMessage
            Condition:
              ArnEquals:
                aws:SourceArn:
                  Ref: CdkWorkshopTopicD368A42F
            Effect: Allow
            Principal:
              Service: sns.amazonaws.com
            Resource:
              Fn::GetAtt:
                - CdkWorkshopQueue50D9D426
                - Arn
        Version: "2012-10-17"
      Queues:
        - Ref: CdkWorkshopQueue50D9D426
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopQueue/Policy/Resource
  CdkWorkshopQueueCdkWorkshopStackCdkWorkshopTopicD7BE96438B5AD106:
    Type: AWS::SNS::Subscription
    Properties:
      Endpoint:
        Fn::GetAtt:
          - CdkWorkshopQueue50D9D426
          - Arn
      Protocol: sqs
      TopicArn:
        Ref: CdkWorkshopTopicD368A42F
    DependsOn:
      - CdkWorkshopQueuePolicyAF2494A5
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopQueue/CdkWorkshopStackCdkWorkshopTopicD7BE9643/Resource
  CdkWorkshopTopicD368A42F:
    Type: AWS::SNS::Topic
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CdkWorkshopTopic/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Analytics: v2:deflate64:H4sIAAAAAAAA/1WOWwrCMBBF1+J/Opq6hG5AW/9Lm0SYtiY1kygSsnfzAMGfmXMPF2Za4PwMp8P0pkbItdlwhjC4SawsqTHQkyBcvfKKdXddocyL2VB8frLGyEin/uBnEhZ3h0bnxl++mR1FtgVizNgrMt6KcqMzWmJuRqaNVLDQ8dVy4OnJhRAb67XDh4K+7i/mSy26wQAAAA==
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CDKMetadata/Default
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
    Fn::Or:
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - af-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ca-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-northwest-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-2
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-3
          - Fn::Equals:
              - Ref: AWS::Region
              - il-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - me-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - me-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - sa-east-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-2
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-2
Parameters:
  BootstrapVersion:
    Type: AWS::SSM::Parameter::Value<String>
    Default: /cdk-bootstrap/hnb659fds/version
    Description: Version of the CDK Bootstrap resources in this environment, automatically retrieved from SSM Parameter Store. [cdk:skip]
Rules:
  CheckBootstrapVersion:
    Assertions:
      - Assert:
          Fn::Not:
            - Fn::Contains:
                - - "1"
                  - "2"
                  - "3"
                  - "4"
                  - "5"
                - Ref: BootstrapVersion
        AssertDescription: CDK bootstrap stack version 6 required. Please run 'cdk bootstrap' with a recent version of the CDK CLI.
```

Okay, we’ve got a CloudFormation template. What’s next? 

**Let’s deploy it into our account!**

# Bootstrapping an environment

[Bootstrapping - AWS Cloud Development Kit (AWS CDK) v2](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)

The first time you deploy an AWS CDK app into an environment (account/region), you can install a “bootstrap stack”. This stack includes resources that are used in the toolkit’s operation. For example, the stack includes an S3 bucket that is used to store templates and assets during the deployment process.

You can use the `cdk bootstrap` command to install the bootstrap stack into an environment:

```tsx
cdk bootstrap
...
⏳  Bootstrapping environment aws://458036673695/eu-central-1...
Trusted accounts for deployment: (none)
Trusted accounts for lookup: (none)
Using default execution policy of 'arn:aws:iam::aws:policy/AdministratorAccess'. Pass '--cloudformation-execution-policies' to customize.
CDKToolkit: creating CloudFormation changeset...
 ✅  Environment aws://458036673695/eu-central-1 bootstrapped.
```

Use `cdk deploy` to deploy a CDK app

You will first be informed of security-related changes that the CDK is going to perform on your behalf, if there are any security-related changes

```tsx
cdk deploy
...
✨  Synthesis time: 2.87s

CdkWorkshopStack:  start: Building 271dd7a7d7c7391fe00500eec1c8682efe94925126acff6da688c27f8267d3e3:current_account-current_region
CdkWorkshopStack:  success: Built 271dd7a7d7c7391fe00500eec1c8682efe94925126acff6da688c27f8267d3e3:current_account-current_region
CdkWorkshopStack:  start: Publishing 271dd7a7d7c7391fe00500eec1c8682efe94925126acff6da688c27f8267d3e3:current_account-current_region
CdkWorkshopStack:  success: Published 271dd7a7d7c7391fe00500eec1c8682efe94925126acff6da688c27f8267d3e3:current_account-current_region
This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
Please confirm you intend to make the following modifications:

IAM Statement Changes
┌───┬──────────────────┬────────┬──────────────────┬──────────────────┬────────────────────┐
│   │ Resource         │ Effect │ Action           │ Principal        │ Condition          │
├───┼──────────────────┼────────┼──────────────────┼──────────────────┼────────────────────┤
│ + │ ${CdkWorkshopQue │ Allow  │ sqs:SendMessage  │ Service:sns.amaz │ "ArnEquals": {     │
│   │ ue.Arn}          │        │                  │ onaws.com        │   "aws:SourceArn": │
│   │                  │        │                  │                  │  "${CdkWorkshopTop │
│   │                  │        │                  │                  │ ic}"               │
│   │                  │        │                  │                  │ }                  │
└───┴──────────────────┴────────┴──────────────────┴──────────────────┴────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Do you wish to deploy these changes (y/n)? **y
...**
CdkWorkshopStack: deploying... [1/1]
CdkWorkshopStack: creating CloudFormation changeset...

✅  CdkWorkshopStack

✨  Deployment time: 16.52s

Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopStack/7050d110-9352-11ee-b818-02bc0e09f02f

✨  Total time: 19.39s
```

This is warning you that deploying the app contains security-sensitive changes. Since we need to allow the topic to send messages to the queue, enter **y** to deploy the stack and create the resources.

Output should look like the following, where ACCOUNT-ID is your account ID, REGION is the region in which you created the app, and STACK-ID is the unique identifier for your stack:

# The CloudFormation Console

CDK apps are deployed through AWS CloudFormation. Each CDK stack maps 1:1 with CloudFormation stack.

This means that you can use the AWS CloudFormation console in order to manage your stacks.

Let’s take a look at the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/home).

You will likely see something like this (if you don’t, make sure you are in the correct region):

![https://cdkworkshop.com/20-typescript/20-create-project/cfn1.png](https://cdkworkshop.com/20-typescript/20-create-project/cfn1.png)

If you select `CdkWorkshopStack` and open the **Resources** tab, you will see the physical identities of our resources:

![https://cdkworkshop.com/20-typescript/20-create-project/cfn2.png](https://cdkworkshop.com/20-typescript/20-create-project/cfn2.png)

# Hello, CDK!

In this chapter, we will finally write some CDK code. Instead of the SNS/SQS code that we have in our app now, we’ll add a Lambda function with an API Gateway endpoint in front of it.

Users will be able to hit any URL in the endpoint and they’ll receive a heartwarming greeting from our function.

![https://cdkworkshop.com/images/hello-arch.png](https://cdkworkshop.com/images/hello-arch.png)

First, let’s clean up the sample code.

```tsx
import * as cdk from 'aws-cdk-lib'

export class CdkWorkshopQueue extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Code

  }
}
```

<aside>
💡 **cdk diff**

Now that we modified our stack’s contents, we can ask the toolkit to show us the difference between our CDK app and what’s currently deployed. This is a safe way to check what will happen once we run `cdk deploy` and is always good practice:

</aside>

```tsx
cdk diff
Stack CdkWorkshopStack
IAM Statement Changes
┌───┬──────────────────────┬────────┬──────────────────────┬──────────────────────┬────────────────────────┐
│   │ Resource             │ Effect │ Action               │ Principal            │ Condition              │
├───┼──────────────────────┼────────┼──────────────────────┼──────────────────────┼────────────────────────┤
│ - │ ${CdkWorkshopQueue.A │ Allow  │ sqs:SendMessage      │ Service:sns.amazonaw │ "ArnEquals": {         │
│   │ rn}                  │        │                      │ s.com                │   "aws:SourceArn": "${ │
│   │                      │        │                      │                      │ CdkWorkshopTopic}"     │
│   │                      │        │                      │                      │ }                      │
└───┴──────────────────────┴────────┴──────────────────────┴──────────────────────┴────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[-] AWS::SQS::Queue CdkWorkshopQueue CdkWorkshopQueue50D9D426 destroy
[-] AWS::SQS::QueuePolicy CdkWorkshopQueue/Policy CdkWorkshopQueuePolicyAF2494A5 destroy
[-] AWS::SNS::Subscription CdkWorkshopQueue/CdkWorkshopStackCdkWorkshopTopicD7BE9643 CdkWorkshopQueueCdkWorkshopStackCdkWorkshopTopicD7BE96438B5AD106 destroy
[-] AWS::SNS::Topic CdkWorkshopTopic CdkWorkshopTopicD368A42F destroy

✨  Number of stacks with differences: 1
```

As expected, all of our resources are going to be brutally **destroyed**.

```tsx
cdk deploy
✨  Synthesis time: 2.48s

CdkWorkshopStack:  start: Building 7a48fba14aa6908b5c4b2231406146217457e908903c24af7355163ea048fbb0:current_account-current_region
CdkWorkshopStack:  success: Built 7a48fba14aa6908b5c4b2231406146217457e908903c24af7355163ea048fbb0:current_account-current_region
CdkWorkshopStack:  start: Publishing 7a48fba14aa6908b5c4b2231406146217457e908903c24af7355163ea048fbb0:current_account-current_region
CdkWorkshopStack:  success: Published 7a48fba14aa6908b5c4b2231406146217457e908903c24af7355163ea048fbb0:current_account-current_region
CdkWorkshopStack: deploying... [1/1]
CdkWorkshopStack: creating CloudFormation changeset...
[█████████████████████████████████▏························] (4/7)

11:07:41 AM | UPDATE_COMPLETE_CLEA | AWS::CloudFormation::Stack | CdkWorkshopStack
11:07:45 AM | DELETE_IN_PROGRESS   | AWS::SNS::Topic    | CdkWorkshopTopicD368A42F
11:07:45 AM | DELETE_IN_PROGRESS   | AWS::SQS::Queue    | CdkWorkshopQueue50D9D426 ...
```

At the end you will see:

```tsx
...
✅  CdkWorkshopStack

✨  Deployment time: 78.1s

Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopStack/7050d110-9352-11ee-b818-02bc0e09f02f

✨  Total time: 80.57s
```

### **Lambda handler code**

We’ll start with the AWS Lambda handler code.

1. Create a directory `lambda` in the root of your project tree (next to `bin` and `lib`).
2. TS CDK projects created with `cdk init` ignore all `.js` files by default. To track these files with git, add `!lambda/*.js` to your `.gitignore` file. This ensures that your Lambda assets are discoverable during the Pipelines section of this tutorial.
3. Add a file called `lambda/hello.js` with the following contents:

```tsx
exports.handler = async function(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    return {
        statusCode: 200,
        headers: { "Content-Type": "text.plain" },
        body: `Hello, CDK! You've hit ${event.path}\n`
    };
};
```

This is a simple Lambda function which returns the text **“Hello, CDK! You’ve hit [url path]”**. The function’s output also includes the HTTP status code and HTTP headers. These are used by API Gateway to formulate the HTTP response to the user.

[What is AWS Lambda? - AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)

# **Install the AWS Lambda construct library**

The AWS CDK is shipped with an extensive library of constructs called the **AWS Construct Library**. The construct library is divided into **modules**, one for each AWS service. For example, if you want to define an AWS Lambda function, we will need to use the AWS Lambda construct library.

[API Reference · AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html)

```tsx
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Define AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_16_X, // exec env
      code: lambda.Code.fromAsset('lambda'), // code loaded from "lambda" dir
      handler: 'hello.handler' // file is "hello", func is "handler"
    });
  }
}
```

### **A word about constructs and constructors**

<aside>
💡

</aside>

[Migrating to AWS CDK v2 - AWS Cloud Development Kit (AWS CDK) v2](https://docs.aws.amazon.com/cdk/v2/guide/migrating-v2.html)

As you can see, the class constructors of both `CdkWorkshopStack` and `lambda.Function` (and many other classes in the CDK) have the signature `(scope, id, props)`. This is because all of these classes are constructs. Constructs are the basic building block of CDK apps. They represent abstract “cloud components” which can be composed together into higher level abstractions via scopes. Scopes can include constructs, which in turn can include other constructs, etc.

Constructs are always created in the scope of another construct and must always have an identifier which must be unique within the scope it’s created. Therefore, construct initializers (constructors) will always have the following signature:

1. `scope`: the first argument is always the scope in which this construct is created. In almost all cases, you’ll be defining constructs within the scope of *current* construct, which means you’ll usually just want to pass `this` for the first argument. Make a habit out of it.
2. `id`: the second argument is the local identity of the construct. It’s an ID that has to be unique amongst construct within the same scope. The CDK uses this identity to calculate the CloudFormation [Logical ID](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html) for each resource defined within this scope. *To read more about IDs in the CDK, see the* [CDK user manual](https://docs.aws.amazon.com/cdk/latest/guide/identifiers.html#identifiers_logical_ids).
3. `props`: the last (sometimes optional) argument is always a set of initialization properties. Those are specific to each construct. For example, the `lambda.Function` construct accepts properties like `runtime`, `code` and `handler`. You can explore the various options using your IDE’s auto-complete or in the [online documentation](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-readme.html).

Save your code, and let’s take a quick look at the diff before we deploy:

```tsx
cdk diff
Stack CdkWorkshopStack
IAM Statement Changes
┌───┬──────────────────────────────┬────────┬────────────────┬───────────────────────────────┬───────────┐
│   │ Resource                     │ Effect │ Action         │ Principal                     │ Condition │
├───┼──────────────────────────────┼────────┼────────────────┼───────────────────────────────┼───────────┤
│ + │ ${HelloHandler/ServiceRole.A │ Allow  │ sts:AssumeRole │ Service:lambda.amazonaws.com  │           │
│   │ rn}                          │        │                │                               │           │
└───┴──────────────────────────────┴────────┴────────────────┴───────────────────────────────┴───────────┘
IAM Policy Changes
┌───┬─────────────────────────────┬──────────────────────────────────────────────────────────────────────┐
│   │ Resource                    │ Managed Policy ARN                                                   │
├───┼─────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ + │ ${HelloHandler/ServiceRole} │ arn:${AWS::Partition}:iam::aws:policy/service-role/AWSLambdaBasicExe │
│   │                             │ cutionRole                                                           │
└───┴─────────────────────────────┴──────────────────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[+] AWS::IAM::Role HelloHandler/ServiceRole HelloHandlerServiceRole11EF7C63 
[+] AWS::Lambda::Function HelloHandler HelloHandler2E4FBA4D 

✨  Number of stacks with differences: 1
```

As you can see, this code synthesizes an **AWS::Lambda::Function** resource. It also synthesized a couple of [CloudFormation parameters](https://docs.aws.amazon.com/cdk/latest/guide/get_cfn_param.html) that are used by the toolkit to propagate the location of the handler code.

```tsx
cdk deploy
...
✅  CdkWorkshopStack

✨  Deployment time: 37.33s

Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopStack/7050d110-9352-11ee-b818-02bc0e09f02f
```

### Testing our function

Let’s go to the AWS Lambda Console and test our function.

Open the [AWS Lambda Console](https://console.aws.amazon.com/lambda/home#/functions) (make sure you are in the correct region). You should see our function.

Click on the function name to go to the console.

Click on the **Test** button to open the **Configure test event** dialog:

Select **Amazon API Gateway AWS Proxy** from the **Event template** list.

Enter `test` under **Event name**.

Expand **Details** in the **Execution result** pane and you should see our expected output:

### **Faster personal deployments**

It’s great that we have a working lambda! But what if we want to tweak the lambda code to get it just right? Let’s say that we have now decided that we want our lambda function to respond with `"Good Morning, CDK!"` instead of `"Hello, CDK"`.

So far, it seems like the only tool we have at our disposal to update our stack is `cdk deploy`. But `cdk deploy` takes time; it has to deploy your CloudFormation stack and upload the `lambda` directory from your disk to the bootstrap bucket. If we’re just changing our lambda code, we don’t actually need to update the CloudFormation stack, so that part of `cdk deploy` is wasted effort.

We really only need to update our lambda code.

→ make some changes in the `body:` and run `cdk deploy`

```tsx
cdk deploy 
**✨  Synthesis time: 13.26s**

CdkWorkshopStack:  start: Building b3297850df371e30c727c9b23853eff4846d6632f9e6b73a41729c0259caeb81:current_account-current_region
CdkWorkshopStack:  success: Built b3297850df371e30c727c9b23853eff4846d6632f9e6b73a41729c0259caeb81:current_account-current_region
CdkWorkshopStack:  start: Building 0cab74fd0b3545eb08e4f1b58b91bbb5aba8a9eb044f3093d921d4d124092c86:current_account-current_region
CdkWorkshopStack:  success: Built 0cab74fd0b3545eb08e4f1b58b91bbb5aba8a9eb044f3093d921d4d124092c86:current_account-current_region
CdkWorkshopStack:  start: Publishing b3297850df371e30c727c9b23853eff4846d6632f9e6b73a41729c0259caeb81:current_account-current_region
CdkWorkshopStack:  start: Publishing 0cab74fd0b3545eb08e4f1b58b91bbb5aba8a9eb044f3093d921d4d124092c86:current_account-current_region
CdkWorkshopStack:  success: Published 0cab74fd0b3545eb08e4f1b58b91bbb5aba8a9eb044f3093d921d4d124092c86:current_account-current_region
CdkWorkshopStack:  success: Published b3297850df371e30c727c9b23853eff4846d6632f9e6b73a41729c0259caeb81:current_account-current_region
CdkWorkshopStack: deploying... [1/1]
CdkWorkshopStack: creating CloudFormation changeset...

 ✅  CdkWorkshopStack

**✨  Deployment time: 21.98s**

Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopStack/7050d110-9352-11ee-b818-02bc0e09f02f

**✨  Total time: 35.25s**
```

### **Hotswap deployments**

<aside>
💡 This command deliberately introduces drift in CloudFormation stacks in order to speed up deployments. For this reason, only use it for development purposes. **Never use hotswap for your production deployments!**

</aside>

We can speed up that deployment time with `cdk deploy --hotswap`, which will assess whether a hotswap deployment can be performed instead of a CloudFormation deployment. If possible, the CDK CLI will use AWS service APIs to directly make the changes; otherwise it will fall back to performing a full CloudFormation deployment.

Here, we will use `cdk deploy --hotswap` to deploy a hotswappable change to your AWS Lambda asset code.

```tsx
cdk deploy --hotswap
**✨  Synthesis time: 12.85s**

⚠️ The --hotswap and --hotswap-fallback flags deliberately introduce CloudFormation drift to speed up deployments
⚠️ They should only be used for development - never use them for your production Stacks!

CdkWorkshopStack:  start: Building 0edd208f5d2f6c477ec3a50bc97f8de3e61280241f5b23296692cb28eded8c54:current_account-current_region
CdkWorkshopStack:  success: Built 0edd208f5d2f6c477ec3a50bc97f8de3e61280241f5b23296692cb28eded8c54:current_account-current_region
CdkWorkshopStack:  start: Building 30562467fd4b2d6034da3878856f6533e1176dbb87903c3981653f0ada313490:current_account-current_region
CdkWorkshopStack:  success: Built 30562467fd4b2d6034da3878856f6533e1176dbb87903c3981653f0ada313490:current_account-current_region
CdkWorkshopStack:  start: Publishing 0edd208f5d2f6c477ec3a50bc97f8de3e61280241f5b23296692cb28eded8c54:current_account-current_region
CdkWorkshopStack:  start: Publishing 30562467fd4b2d6034da3878856f6533e1176dbb87903c3981653f0ada313490:current_account-current_region
CdkWorkshopStack:  success: Published 30562467fd4b2d6034da3878856f6533e1176dbb87903c3981653f0ada313490:current_account-current_region
CdkWorkshopStack:  success: Published 0edd208f5d2f6c477ec3a50bc97f8de3e61280241f5b23296692cb28eded8c54:current_account-current_region
CdkWorkshopStack: deploying... [1/1]

✨ hotswapping resources:
   ✨ Lambda Function 'CdkWorkshopStack-HelloHandler2E4FBA4D-xMvt0Kbw9VKD'
✨ Lambda Function 'CdkWorkshopStack-HelloHandler2E4FBA4D-xMvt0Kbw9VKD' hotswapped!

 ✅  CdkWorkshopStack

**✨  Deployment time: 2.07s**

Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopStack/7050d110-9352-11ee-b818-02bc0e09f02f

**✨  Total time: 14.92s**
```

Deployment time dropped down from 21.98s to 2.07s

```
⚠️ The --hotswap flag deliberately introduces CloudFormation drift to speed up deployments
```

Open the [AWS Lambda Console](https://console.aws.amazon.com/lambda/home#/functions) (make sure you are in the correct region). You should see our function with changes. 

### **CDK Watch**

We can do better than calling `cdk deploy` or `cdk deploy --hotswap` each time. `cdk watch` is similar to `cdk deploy` except that instead of being a one-shot operation, it monitors your code and assets for changes and attempts to perform a deployment automatically when a change is detected. By default, `cdk watch` will use the `--hotswap` flag, which inspects the changes and determines if those changes can be hotswapped. Calling `cdk watch --no-hotswap` will disable the hotswap behavior.

Once we set it up, we can use `cdk watch` to detect both hotswappable changes and changes that require full CloudFormation deployment.

### Modify your `cdk.json` file

When the `cdk watch` command runs, the files that it observes are determined by the `"watch"` setting in the `cdk.json` file. It has two sub-keys, `"include"` and `"exclude"`, each of which can be either a single string or an array of strings. Each entry is interpreted as a path relative to the location of the `cdk.json` file. Globs, both `*` and `**`, are allowed to be used.

Your `cdk.json` file should look similar to this:

```tsx
{
  "app": "npx ts-node --prefer-ts-exts bin/cdk-workshop.ts",
  "watch": {
    "include": [
      "**"
    ],
    "exclude": [
      "README.md",
      "cdk*.json",
      "**/*.d.ts",
      ~~"**/*.js",~~
      "tsconfig.json",
      "package*.json",
      "yarn.lock",
      "node_modules",
      "test"
    ]
  },
  "context": {
    // ...
  }
}
```

The sample app comes with a suggested `"watch"` setting. We do in fact want to observe our `.js` files in the `lambda` folder, so let’s remove `"**/*.js"` from the `"exclude"` list.

```tsx
cdk watch // Running process. 
```

This will trigger an initial deployment and immediately begin observing the files we’ve specified in `cdk.json`.

Once you save the changes to your Lambda code file, `cdk watch` will recognize that your file has changed and trigger a new deployment. In this case, it will recognize that we can hotswap the lambda asset code, so it will bypass a CloudFormation deployment and deploy directly to the Lambda service instead.

More on `cdk watch`…

[Increasing development speed with CDK Watch | Amazon Web Services](https://aws.amazon.com/blogs/developer/increasing-development-speed-with-cdk-watch/)

### API Gateway

Next step is to add an API Gateway in front of our function. API Gateway will expose a public HTTP endpoint that anyone on the internet can hit with an HTTP client such as [curl](https://curl.haxx.se/) or a web browser.

We will use [Lambda proxy integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html) mounted to the root of the API. This means that any request to any URL path will be proxied directly to our Lambda function, and the response from the function will be returned back to the user.

```tsx
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
```

That’s it. This is all you need to do in order to define an API Gateway which proxies all requests to an AWS Lambda function.

```tsx
cdk diff
```

A few lines of code added 12 new resources to our stack.

```tsx
cdk deploy
```

### **Testing your app**

When deployment is complete, you’ll notice this line:

```tsx
...
✅  CdkWorkshopStack

✨  Deployment time: 32.1s

Outputs:
**CdkWorkshopStack.Endpoint8024A810 = https://e258rzfuv7.execute-api.eu-central-1.amazonaws.com/prod/**
Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopStack/7050d110-9352-11ee-b818-02bc0e09f02f

✨  Total time: 34.71s
```

Another way to find a URL: go to [API Gateway](https://eu-central-1.console.aws.amazon.com/apigateway/main/apis?region=eu-central-1) console and find a [Endpoint](https://eu-central-1.console.aws.amazon.com/apigateway/main/apis/e258rzfuv7/resources?api=e258rzfuv7&region=eu-central-1) REST API there. Click on the name of the api and from the left-side menu under API:Endpoint click on Stages. Under **Stage details** you can find an Invoke URL which will look something like this: [https://e258rzfuv7.execute-api.eu-central-1.amazonaws.com/prod](https://e258rzfuv7.execute-api.eu-central-1.amazonaws.com/prod). To test the api you can clock on the link directly from API Gateway Console or use `curl`. 

```tsx
curl url https://e258rzfuv7.execute-api.eu-central-1.amazonaws.com/prod/
Hello, CDK! You've hit /
```

# Writing constructs

In this chapter we will define a new construct called `HitCounter`. This construct can be attached to any Lambda function that’s used as an API Gateway backend, and it will count how many requests were issued to each URL path. It will store this in a DynamoDB table.

![Untitled](AWS%20CDK%20cc582c44599a460599be0f6bdc90db6f/Untitled.png)

Create a new file under `lib` called `hitcounter.ts` with the following content:

```tsx
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    // TODO
  }
}
```

Save the file. Oops, an error! No worries, we’ll be using `props` shortly.

**What’s going on here?**

- We declared a new construct class called `HitCounter`.
- As usual, constructor arguments are `scope`, `id` and `props`. And as usual, we propagate `scope` and `id` to the `cdk.Construct` base class.
- The `props` argument is of type `HitCounterProps` which includes a single property `downstream` of type `lambda.IFunction`. This is where we are going to “plug in” the Lambda function we created in the previous chapter so it can be hit-counted.

Okay, now let’s write the Lambda handler code for our hit counter.

Create the file `lambda/hitcounter.js`

```tsx
const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function(event) {
    console.log("request:", JSON/stringify(event, undefined, 2));

    // create SDK clients
    const dynamo = new DynamoDB();
    const lambdd = new Lambda();

    // Update the db entry for "path" with hits++
    await dynamo.updateItem({
        TableName: process.env.HITS_TABLE_NAME,
        key: { path: { S: event.path } },
        UpdateExpressionAttributeValues: { ':incr': { N: '1' } }
    }).promise();

    // call downsream func and capture response
    const resp = await Lambda.invoke({
        FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
        Payload: JSON.stringify(event)
    }).promise();

    console.log('downstream response:', JSON.stringify(resp, undefined, 2));
    
    // return response to upstream caller
    return JSON.parse(resp.Payload);
}
```

Environmental variables: 

- `HITS_TABLE_NAME` is the name of the DynamoDB table to use for storage.
- `DOWNSTREAM_FUNCTION_NAME` is the name of the downstream AWS Lambda function.

**Add resources to the hit counter construct**

Now, let’s define the AWS Lambda function and the DynamoDB table in our `HitCounter` construct. Go back to `lib/hitcounter.ts` and add the following highlighted code:

```tsx
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
**import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';**
import { Construct } from 'constructs';

export interface HitCounterProps {
    // The function for which we want to count url hits
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

    // Allow accessing the counter func
    **public readonly handler: lambda.Function;** 

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

    **const table = new dynamodb.Table(this, 'Hits', {
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'hitcounter.handler', 
        code: lambda.Code.fromAsset('lambda'),
        environment: {
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
            HITS_TABLE_NAME: table.tableName
        }
    });**
   }
}
```

What did we do here?

- We defined a DynamoDB table with `path` as the partition key.
- We defined a Lambda function which is bound to the `lambda/hitcounter.handler` code.
- We **wired** the Lambda’s environment variables to the `functionName` and `tableName` of our resources.

The `functionName` and `tableName` properties are values that only resolve when we deploy our stack (notice that we haven’t configured these physical names when we defined the table/function, only logical IDs). This means that if you print their values during synthesis, you will get a “TOKEN”, which is how the CDK represents these late-bound values. You should treat tokens as *opaque strings*. This means you can concatenate them together for example, but don’t be tempted to parse them in your code.

Let’s use it in our app. Open `lib/cdk-workshop-stack.ts` and add the following highlighted code:

```tsx
import * as cdk from 'aws-cdk-lib';
import* as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from './hitcounter';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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
  }
}
```

Notice that we changed our API Gateway handler to `helloWithCounter.handler` instead of `hello`. This basically means that whenever our endpoint is hit, API Gateway will route the request to our hit counter handler, which will log the hit and relay it over to the `hello` function. Then, the responses will be relayed back in the reverse order all the way to the user.

```tsx
cdk deploy
```

Pay attention to the URL with endpoint…

```tsx
...
✅  CdkWorkshopStack

✨  Deployment time: 57.9s

Outputs:
CdkWorkshopStack.Endpoint8024A810 = https://e258rzfuv7.execute-api.eu-central-1.amazonaws.com/prod/
Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopStack/7050d110-9352-11ee-b818-02bc0e09f02f

✨  Total time: 60.5s
```

```tsx
curl -i https://e258rzfuv7.execute-api.eu-central-1.amazonaws.com/prod/
...
HTTP/2 502 
content-type: application/json
content-length: 36
date: Tue, 05 Dec 2023 15:01:54 GMT
x-amzn-requestid: 290914f7-f830-4b2f-b35a-fb5b5076a5fa
x-amzn-errortype: InternalServerErrorException
x-amz-apigw-id: PeY3dHlYFiAEc6Q=
x-cache: Error from cloudfront
via: 1.1 69cc5dd318e02cb1a7e8cb9951f553d8.cloudfront.net (CloudFront)
x-amz-cf-pop: FRA56-P3
x-amz-cf-id: Rhr2pw-5X-aWh2J661jkvGBB1h-reEZhbZ8Tn5w_Ca05Lz3vomn_MA==

{"message": "Internal server error"}%
```

To understand what’s wrong we have to check the logs in AWS Console.

**Viewing CloudWatch logs for our Lambda function**

The first thing to do is to go and look at the logs of our hit counter AWS Lambda function.

There are many tools that help you do that like [SAM CLI](https://github.com/awslabs/aws-sam-cli) and [awslogs](https://github.com/jorgebastida/awslogs). In this workshop, we’ll show you how to find your logs through the AWS console.

Open the [AWS Lambda console](https://console.aws.amazon.com/lambda/home) (make sure you are connected to the correct region).

Click on the **HitCounter** Lambda function (the name should contain the string `CdkWorkshopStack-HelloHitCounter`):

Under **Monitor** Tab click on **View CloudWatch Logs**.

Find the latest event (if there are several log streams) or the most-recent log group.

Look for the most-recent message containing the string “errorMessage”. You’ll likely see something like this:

```tsx
...
"errorType": "AccessDeniedException",
...
```

It seems like our Lambda function can’t write to our DynamoDB table. This actually makes sense - we didn’t grant it those permissions! Let’s go do that now.

**Allow Lambda to read/write our DynamoDB table**

Let’s give our Lambda’s execution role permissions to read/write from our table.

Go back to `hitcounter.ts` and add the following highlighted lines:

```tsx
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
    // The function for which we want to count url hits
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

    // Allow accessing the counter func
    public readonly handler: lambda.Function; 

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
        });

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hitcounter.handler', 
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });

        // Grant the lambda role read/ write permissions to the table
        **table.grantReadWriteData(this.handler);**
    }
}
```

Deploy with `cdk deploy` 

Test again

```tsx
curl -i https://e258rzfuv7.execute-api.eu-central-1.amazonaws.com/prod/
```

And again…

```tsx
...
"errorType": "AccessDeniedException",
...
```

But with some more details

```tsx
"errorMessage": "User: arn:aws:sts::458036673695:assumed-role/CdkWorkshopStack-HelloHitCounterHitCounterHandlerSe-6m8GE1KfO4P6/CdkWorkshopStack-HelloHitCounterHitCounterHandlerD-GbRYSkrqPIYV is not authorized to perform: lambda:InvokeFunction on resource: arn:aws:lambda:eu-central-1:458036673695:function:CdkWorkshopStack-HelloHandler2E4FBA4D-xMvt0Kbw9VKD because no identity-based policy allows the lambda:InvokeFunction action",
```

So it seems like our hit counter actually managed to write to the database. We can confirm by going to the [DynamoDB Console](https://console.aws.amazon.com/dynamodb/home).

But, we must also give our hit counter permissions to invoke the downstream lambda function.

You can check what this did using `cdk diff`:

```tsx
cdk diff
```

The **Resource** section should look something like this, which shows the IAM statement was added to the role:

```tsx
Resources
[~] AWS::IAM::Policy HelloHitCounter/HitCounterHandler/ServiceRole/DefaultPolicy HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A 
 └─ [~] PolicyDocument
     └─ [~] .Statement:
         └─ @@ -26,5 +26,31 @@
            [ ]         "Ref": "AWS::NoValue"
            [ ]       }
            [ ]     ]
            [+]   },
            [+]   {
            [+]     "Action": "lambda:InvokeFunction",
            [+]     "Effect": "Allow",
            [+]     "Resource": [
            [+]       {
            [+]         "Fn::GetAtt": [
            [+]           "HelloHandler2E4FBA4D",
            [+]           "Arn"
            [+]         ]
            [+]       },
            [+]       {
            [+]         "Fn::Join": [
            [+]           "",
            [+]           [
            [+]             {
            [+]               "Fn::GetAtt": [
            [+]                 "HelloHandler2E4FBA4D",
            [+]                 "Arn"
            [+]               ]
            [+]             },
            [+]             ":*"
            [+]           ]
            [+]         ]
            [+]       }
            [+]     ]
            [ ]   }
            [ ] ]

✨  Number of stacks with differences: 1
```

Which is exactly what we wanted. Deploy and test. 

```tsx
HTTP/2 200 
content-type: text.plain
content-length: 25
date: Tue, 05 Dec 2023 15:50:28 GMT
x-amzn-requestid: 0d5fdca2-f4ed-410e-9971-1f668e14cdae
x-amz-apigw-id: Pef-dGiUliAEStQ=
x-amzn-trace-id: Root=1-656f46c2-7d24085a1506950320956d38;Sampled=0;lineage=bc19e6b0:0
x-cache: Miss from cloudfront
via: 1.1 69cc5dd318e02cb1a7e8cb9951f553d8.cloudfront.net (CloudFront)
x-amz-cf-pop: FRA56-P3
x-amz-cf-id: Ns3EApfKFwwx5Z0Ki21X6N5hLjhv_rjLaJbJPsfBSTk5H77q74COuQ==

Hello, CDK! You've hit /
```

**Issue a few test requests**

Let’s issue a few requests and see if our hit counter works. You can also use your web browser to do that:

```
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello/world
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello/world
```

Select `Tables` in the navigation pane and select the table that starts with `CdkWorkdShopStack-HelloHitCounterHits`

![Screenshot 2023-12-05 at 16.53.09.png](AWS%20CDK%20cc582c44599a460599be0f6bdc90db6f/Screenshot_2023-12-05_at_16.53.09.png)

Hint: if you don’t see ANY tables → check the region, it should be the region whre you have created your table. 

**Good job!**

The cool thing about our `HitCounter` is that it’s quite useful. It basically allows anyone to “attach” it to any Lambda function that serves as an API Gateway proxy backend and it will log hits to this API.

Since our hit counter is a simple JavaScript class, you could package it into an npm module and publish it to [npmjs.org](http://npmjs.org/), which is the JavaScript package manager. Then, anyone could `npm install` it and add it to their CDK apps.

# Using construct libraries

### Reading documentation

Browse to the [cdk-dynamo-table-viewer page](https://www.npmjs.com/package/cdk-dynamo-table-viewer) on npmjs.org and read the module documentation.

> As mentioned in the README page of this library, it is not intended for production use. Namely because it will expose contents from your DynamoDB table to anyone without authentication
> 

Before you can use the table viewer in your application, you’ll need to install the npm module:

```
npm install cdk-dynamo-table-viewer@0.2.46
```

Output should look like this:

```
+ cdk-dynamo-table-viewer@0.2.46
added 1 package from 1 contributor and audited 886517 packages in 6.704s
found 0 vulnerabilities
```

### **Add a table viewer to your stack**

```tsx
import * as cdk from 'aws-cdk-lib';
import* as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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
      **table: see below...**
    });
  }
}
```

**What about the table?** What we want is to somehow access the DynamoDB table behind our hit counter. However, the current API of our hit counter doesn’t expose the table as a public member.

We’ll expose our table as a property of `HitCounter` so we can access it from our stack.

**Add a table property to our hit counter**

Edit `hitcounter.ts` and modify it as such `table` is exposed as a public property.

```tsx
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
    // The function for which we want to count url hits
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

    // Allow accessing the counter func
    public readonly handler: lambda.Function; 

    **public readonly table: dynamodb.Table;**

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
        });
        
        **this.table = table;**

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hitcounter.handler', 
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });

        // Grant the lambda role read/ write permissions to the table
        table.grantReadWriteData(this.handler);

        // Grant thr lambda role invoke permessions to the downstream function
        props.downstream.grantInvoke(this.handler);
    }
}
```

Now we can access the table from our stack. Go back to `cdk-workshop-stack.ts` and assign the `table` property of the table viewer:

```tsx
...

new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello hits',
      table: helloWithCounter.table
    });
...
```

```tsx
cdk diff
```

You’ll notice that the table viewer adds another API Gateway endpoint, a Lambda function, permissions, outputs, all sorts of goodies.

<aside>
💡 Construct libraries are a very powerful concept. They allow you to add complex capabilities to your apps with minimum effort. However, you must understand that with great power comes great responsibility. Constructs can add IAM permissions, expose data to the public or cause your application not to function. We are working on providing you tools for protecting your app, and identifying potential security issues with your stacks, but it is your responsibility to understand how certain constructs that you use impact your application, and to make sure you only use construct libraries from vendors you trust

</aside>

```tsx
cdk deploy
```

I have seen an error… 

```tsx
❌ Deployment failed: Error:... "The runtime parameter of nodejs12.x is no longer supported for creating or updating AWS Lambda functions.
```

Check `cdk synth` to find the reference to Nodejs12.x

```tsx
Resources:
  HelloHandlerServiceRole11EF7C63:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
        Version: "2012-10-17"
      ManagedPolicyArns:
        - Fn::Join:
            - ""
            - - "arn:"
              - Ref: AWS::Partition
              - :iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    Metadata:
      aws:cdk:path: CdkWorkshopStack/HelloHandler/ServiceRole/Resource
  HelloHandler2E4FBA4D:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        S3Bucket:
          Fn::Sub: cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}
        S3Key: 0aab98d97cf44a6dd2d754ffa01d130808d07924f9f8b1455308cca04716e98f.zip
      Handler: hello.handler
      Role:
        Fn::GetAtt:
          - HelloHandlerServiceRole11EF7C63
          - Arn
      Runtime: nodejs16.x
    DependsOn:
      - HelloHandlerServiceRole11EF7C63
    Metadata:
      aws:cdk:path: CdkWorkshopStack/HelloHandler/Resource
      aws:asset:path: asset.0aab98d97cf44a6dd2d754ffa01d130808d07924f9f8b1455308cca04716e98f
      aws:asset:is-bundled: false
      aws:asset:property: Code
  HelloHitCounterHits7AAEBF80:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
        - AttributeName: path
          AttributeType: S
      KeySchema:
        - AttributeName: path
          KeyType: HASH
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: CdkWorkshopStack/HelloHitCounter/Hits/Resource
  HelloHitCounterHitCounterHandlerServiceRoleD45002B8:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
        Version: "2012-10-17"
      ManagedPolicyArns:
        - Fn::Join:
            - ""
            - - "arn:"
              - Ref: AWS::Partition
              - :iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    Metadata:
      aws:cdk:path: CdkWorkshopStack/HelloHitCounter/HitCounterHandler/ServiceRole/Resource
  HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A:
    Type: AWS::IAM::Policy
    Properties:
      PolicyDocument:
        Statement:
          - Action:
              - dynamodb:BatchGetItem
              - dynamodb:BatchWriteItem
              - dynamodb:ConditionCheckItem
              - dynamodb:DeleteItem
              - dynamodb:DescribeTable
              - dynamodb:GetItem
              - dynamodb:GetRecords
              - dynamodb:GetShardIterator
              - dynamodb:PutItem
              - dynamodb:Query
              - dynamodb:Scan
              - dynamodb:UpdateItem
            Effect: Allow
            Resource:
              - Fn::GetAtt:
                  - HelloHitCounterHits7AAEBF80
                  - Arn
              - Ref: AWS::NoValue
          - Action: lambda:InvokeFunction
            Effect: Allow
            Resource:
              - Fn::GetAtt:
                  - HelloHandler2E4FBA4D
                  - Arn
              - Fn::Join:
                  - ""
                  - - Fn::GetAtt:
                        - HelloHandler2E4FBA4D
                        - Arn
                    - :*
        Version: "2012-10-17"
      PolicyName: HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A
      Roles:
        - Ref: HelloHitCounterHitCounterHandlerServiceRoleD45002B8
    Metadata:
      aws:cdk:path: CdkWorkshopStack/HelloHitCounter/HitCounterHandler/ServiceRole/DefaultPolicy/Resource
  HelloHitCounterHitCounterHandlerDAEA7B37:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        S3Bucket:
          Fn::Sub: cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}
        S3Key: 0aab98d97cf44a6dd2d754ffa01d130808d07924f9f8b1455308cca04716e98f.zip
      Environment:
        Variables:
          DOWNSTREAM_FUNCTION_NAME:
            Ref: HelloHandler2E4FBA4D
          HITS_TABLE_NAME:
            Ref: HelloHitCounterHits7AAEBF80
      Handler: hitcounter.handler
      Role:
        Fn::GetAtt:
          - HelloHitCounterHitCounterHandlerServiceRoleD45002B8
          - Arn
      Runtime: nodejs16.x
    DependsOn:
      - HelloHitCounterHitCounterHandlerServiceRoleDefaultPolicy1487A60A
      - HelloHitCounterHitCounterHandlerServiceRoleD45002B8
    Metadata:
      aws:cdk:path: CdkWorkshopStack/HelloHitCounter/HitCounterHandler/Resource
      aws:asset:path: asset.0aab98d97cf44a6dd2d754ffa01d130808d07924f9f8b1455308cca04716e98f
      aws:asset:is-bundled: false
      aws:asset:property: Code
  EndpointEEF1FD8F:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: Endpoint
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Resource
  EndpointDeployment318525DA7a02bafcf1f33a692d15312adb602478:
    Type: AWS::ApiGateway::Deployment
    Properties:
      Description: Automatically created by the RestApi construct
      RestApiId:
        Ref: EndpointEEF1FD8F
    DependsOn:
      - EndpointproxyANYC09721C5
      - Endpointproxy39E2174E
      - EndpointANY485C938B
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Deployment/Resource
  EndpointDeploymentStageprodB78BEEA0:
    Type: AWS::ApiGateway::Stage
    Properties:
      DeploymentId:
        Ref: EndpointDeployment318525DA7a02bafcf1f33a692d15312adb602478
      RestApiId:
        Ref: EndpointEEF1FD8F
      StageName: prod
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/DeploymentStage.prod/Resource
  Endpointproxy39E2174E:
    Type: AWS::ApiGateway::Resource
    Properties:
      ParentId:
        Fn::GetAtt:
          - EndpointEEF1FD8F
          - RootResourceId
      PathPart: "{proxy+}"
      RestApiId:
        Ref: EndpointEEF1FD8F
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Default/{proxy+}/Resource
  EndpointproxyANYApiPermissionCdkWorkshopStackEndpoint018E8349ANYproxy747DCA52:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName:
        Fn::GetAtt:
          - HelloHitCounterHitCounterHandlerDAEA7B37
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        Fn::Join:
          - ""
          - - "arn:"
            - Ref: AWS::Partition
            - ":execute-api:"
            - Ref: AWS::Region
            - ":"
            - Ref: AWS::AccountId
            - ":"
            - Ref: EndpointEEF1FD8F
            - /
            - Ref: EndpointDeploymentStageprodB78BEEA0
            - /*/*
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Default/{proxy+}/ANY/ApiPermission.CdkWorkshopStackEndpoint018E8349.ANY..{proxy+}
  EndpointproxyANYApiPermissionTestCdkWorkshopStackEndpoint018E8349ANYproxy41939001:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName:
        Fn::GetAtt:
          - HelloHitCounterHitCounterHandlerDAEA7B37
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        Fn::Join:
          - ""
          - - "arn:"
            - Ref: AWS::Partition
            - ":execute-api:"
            - Ref: AWS::Region
            - ":"
            - Ref: AWS::AccountId
            - ":"
            - Ref: EndpointEEF1FD8F
            - /test-invoke-stage/*/*
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Default/{proxy+}/ANY/ApiPermission.Test.CdkWorkshopStackEndpoint018E8349.ANY..{proxy+}
  EndpointproxyANYC09721C5:
    Type: AWS::ApiGateway::Method
    Properties:
      AuthorizationType: NONE
      HttpMethod: ANY
      Integration:
        IntegrationHttpMethod: POST
        Type: AWS_PROXY
        Uri:
          Fn::Join:
            - ""
            - - "arn:"
              - Ref: AWS::Partition
              - ":apigateway:"
              - Ref: AWS::Region
              - :lambda:path/2015-03-31/functions/
              - Fn::GetAtt:
                  - HelloHitCounterHitCounterHandlerDAEA7B37
                  - Arn
              - /invocations
      ResourceId:
        Ref: Endpointproxy39E2174E
      RestApiId:
        Ref: EndpointEEF1FD8F
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Default/{proxy+}/ANY/Resource
  EndpointANYApiPermissionCdkWorkshopStackEndpoint018E8349ANYE84BEB04:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName:
        Fn::GetAtt:
          - HelloHitCounterHitCounterHandlerDAEA7B37
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        Fn::Join:
          - ""
          - - "arn:"
            - Ref: AWS::Partition
            - ":execute-api:"
            - Ref: AWS::Region
            - ":"
            - Ref: AWS::AccountId
            - ":"
            - Ref: EndpointEEF1FD8F
            - /
            - Ref: EndpointDeploymentStageprodB78BEEA0
            - /*/
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Default/ANY/ApiPermission.CdkWorkshopStackEndpoint018E8349.ANY..
  EndpointANYApiPermissionTestCdkWorkshopStackEndpoint018E8349ANYB6CC1B64:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName:
        Fn::GetAtt:
          - HelloHitCounterHitCounterHandlerDAEA7B37
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        Fn::Join:
          - ""
          - - "arn:"
            - Ref: AWS::Partition
            - ":execute-api:"
            - Ref: AWS::Region
            - ":"
            - Ref: AWS::AccountId
            - ":"
            - Ref: EndpointEEF1FD8F
            - /test-invoke-stage/*/
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Default/ANY/ApiPermission.Test.CdkWorkshopStackEndpoint018E8349.ANY..
  EndpointANY485C938B:
    Type: AWS::ApiGateway::Method
    Properties:
      AuthorizationType: NONE
      HttpMethod: ANY
      Integration:
        IntegrationHttpMethod: POST
        Type: AWS_PROXY
        Uri:
          Fn::Join:
            - ""
            - - "arn:"
              - Ref: AWS::Partition
              - ":apigateway:"
              - Ref: AWS::Region
              - :lambda:path/2015-03-31/functions/
              - Fn::GetAtt:
                  - HelloHitCounterHitCounterHandlerDAEA7B37
                  - Arn
              - /invocations
      ResourceId:
        Fn::GetAtt:
          - EndpointEEF1FD8F
          - RootResourceId
      RestApiId:
        Ref: EndpointEEF1FD8F
    Metadata:
      aws:cdk:path: CdkWorkshopStack/Endpoint/Default/ANY/Resource
  ViewHitCounterRenderedServiceRole254DB4EA:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
        Version: "2012-10-17"
      ManagedPolicyArns:
        - Fn::Join:
            - ""
            - - "arn:"
              - Ref: AWS::Partition
              - :iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/Rendered/ServiceRole/Resource
  ViewHitCounterRenderedServiceRoleDefaultPolicy9ADB8C83:
    Type: AWS::IAM::Policy
    Properties:
      PolicyDocument:
        Statement:
          - Action:
              - dynamodb:BatchGetItem
              - dynamodb:ConditionCheckItem
              - dynamodb:DescribeTable
              - dynamodb:GetItem
              - dynamodb:GetRecords
              - dynamodb:GetShardIterator
              - dynamodb:Query
              - dynamodb:Scan
            Effect: Allow
            Resource:
              - Fn::GetAtt:
                  - HelloHitCounterHits7AAEBF80
                  - Arn
              - Ref: AWS::NoValue
        Version: "2012-10-17"
      PolicyName: ViewHitCounterRenderedServiceRoleDefaultPolicy9ADB8C83
      Roles:
        - Ref: ViewHitCounterRenderedServiceRole254DB4EA
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/Rendered/ServiceRole/DefaultPolicy/Resource
  ViewHitCounterRendered9C783E45:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        S3Bucket:
          Fn::Sub: cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}
        S3Key: e2d9f4c587faa240510bb9cd1c0afe3112663d6336529432a852f5e452cf6456.zip
      Environment:
        Variables:
          TABLE_NAME:
            Ref: HelloHitCounterHits7AAEBF80
          TITLE: Hello hits
          SORT_BY: ""
      Handler: index.handler
      Role:
        Fn::GetAtt:
          - ViewHitCounterRenderedServiceRole254DB4EA
          - Arn
      **Runtime: nodejs12.x**
    DependsOn:
      - ViewHitCounterRenderedServiceRoleDefaultPolicy9ADB8C83
      - ViewHitCounterRenderedServiceRole254DB4EA
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/Rendered/Resource
      aws:asset:path: asset.e2d9f4c587faa240510bb9cd1c0afe3112663d6336529432a852f5e452cf6456
      aws:asset:is-bundled: false
      aws:asset:property: Code
  ViewHitCounterViewerEndpoint5A0EF326:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: ViewerEndpoint
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Resource
  ViewHitCounterViewerEndpointDeployment1CE7C57615fe4c294585f18a4ed474d2b246124b:
    Type: AWS::ApiGateway::Deployment
    Properties:
      Description: Automatically created by the RestApi construct
      RestApiId:
        Ref: ViewHitCounterViewerEndpoint5A0EF326
    DependsOn:
      - ViewHitCounterViewerEndpointproxyANYFF4B8F5B
      - ViewHitCounterViewerEndpointproxy2F4C239F
      - ViewHitCounterViewerEndpointANY66F2285B
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Deployment/Resource
  ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7:
    Type: AWS::ApiGateway::Stage
    Properties:
      DeploymentId:
        Ref: ViewHitCounterViewerEndpointDeployment1CE7C57615fe4c294585f18a4ed474d2b246124b
      RestApiId:
        Ref: ViewHitCounterViewerEndpoint5A0EF326
      StageName: prod
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/DeploymentStage.prod/Resource
  ViewHitCounterViewerEndpointproxy2F4C239F:
    Type: AWS::ApiGateway::Resource
    Properties:
      ParentId:
        Fn::GetAtt:
          - ViewHitCounterViewerEndpoint5A0EF326
          - RootResourceId
      PathPart: "{proxy+}"
      RestApiId:
        Ref: ViewHitCounterViewerEndpoint5A0EF326
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Default/{proxy+}/Resource
  ViewHitCounterViewerEndpointproxyANYApiPermissionCdkWorkshopStackViewHitCounterViewerEndpointA52B16FFANYproxy252C605A:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName:
        Fn::GetAtt:
          - ViewHitCounterRendered9C783E45
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        Fn::Join:
          - ""
          - - "arn:"
            - Ref: AWS::Partition
            - ":execute-api:"
            - Ref: AWS::Region
            - ":"
            - Ref: AWS::AccountId
            - ":"
            - Ref: ViewHitCounterViewerEndpoint5A0EF326
            - /
            - Ref: ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7
            - /*/*
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Default/{proxy+}/ANY/ApiPermission.CdkWorkshopStackViewHitCounterViewerEndpointA52B16FF.ANY..{proxy+}
  ViewHitCounterViewerEndpointproxyANYApiPermissionTestCdkWorkshopStackViewHitCounterViewerEndpointA52B16FFANYproxy1404CEF4:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName:
        Fn::GetAtt:
          - ViewHitCounterRendered9C783E45
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        Fn::Join:
          - ""
          - - "arn:"
            - Ref: AWS::Partition
            - ":execute-api:"
            - Ref: AWS::Region
            - ":"
            - Ref: AWS::AccountId
            - ":"
            - Ref: ViewHitCounterViewerEndpoint5A0EF326
            - /test-invoke-stage/*/*
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Default/{proxy+}/ANY/ApiPermission.Test.CdkWorkshopStackViewHitCounterViewerEndpointA52B16FF.ANY..{proxy+}
  ViewHitCounterViewerEndpointproxyANYFF4B8F5B:
    Type: AWS::ApiGateway::Method
    Properties:
      AuthorizationType: NONE
      HttpMethod: ANY
      Integration:
        IntegrationHttpMethod: POST
        Type: AWS_PROXY
        Uri:
          Fn::Join:
            - ""
            - - "arn:"
              - Ref: AWS::Partition
              - ":apigateway:"
              - Ref: AWS::Region
              - :lambda:path/2015-03-31/functions/
              - Fn::GetAtt:
                  - ViewHitCounterRendered9C783E45
                  - Arn
              - /invocations
      ResourceId:
        Ref: ViewHitCounterViewerEndpointproxy2F4C239F
      RestApiId:
        Ref: ViewHitCounterViewerEndpoint5A0EF326
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Default/{proxy+}/ANY/Resource
  ViewHitCounterViewerEndpointANYApiPermissionCdkWorkshopStackViewHitCounterViewerEndpointA52B16FFANY00F849F4:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName:
        Fn::GetAtt:
          - ViewHitCounterRendered9C783E45
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        Fn::Join:
          - ""
          - - "arn:"
            - Ref: AWS::Partition
            - ":execute-api:"
            - Ref: AWS::Region
            - ":"
            - Ref: AWS::AccountId
            - ":"
            - Ref: ViewHitCounterViewerEndpoint5A0EF326
            - /
            - Ref: ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7
            - /*/
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Default/ANY/ApiPermission.CdkWorkshopStackViewHitCounterViewerEndpointA52B16FF.ANY..
  ViewHitCounterViewerEndpointANYApiPermissionTestCdkWorkshopStackViewHitCounterViewerEndpointA52B16FFANY9EC7D814:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName:
        Fn::GetAtt:
          - ViewHitCounterRendered9C783E45
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        Fn::Join:
          - ""
          - - "arn:"
            - Ref: AWS::Partition
            - ":execute-api:"
            - Ref: AWS::Region
            - ":"
            - Ref: AWS::AccountId
            - ":"
            - Ref: ViewHitCounterViewerEndpoint5A0EF326
            - /test-invoke-stage/*/
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Default/ANY/ApiPermission.Test.CdkWorkshopStackViewHitCounterViewerEndpointA52B16FF.ANY..
  ViewHitCounterViewerEndpointANY66F2285B:
    Type: AWS::ApiGateway::Method
    Properties:
      AuthorizationType: NONE
      HttpMethod: ANY
      Integration:
        IntegrationHttpMethod: POST
        Type: AWS_PROXY
        Uri:
          Fn::Join:
            - ""
            - - "arn:"
              - Ref: AWS::Partition
              - ":apigateway:"
              - Ref: AWS::Region
              - :lambda:path/2015-03-31/functions/
              - Fn::GetAtt:
                  - ViewHitCounterRendered9C783E45
                  - Arn
              - /invocations
      ResourceId:
        Fn::GetAtt:
          - ViewHitCounterViewerEndpoint5A0EF326
          - RootResourceId
      RestApiId:
        Ref: ViewHitCounterViewerEndpoint5A0EF326
    Metadata:
      aws:cdk:path: CdkWorkshopStack/ViewHitCounter/ViewerEndpoint/Default/ANY/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Analytics: v2:deflate64:H4sIAAAAAAAA/1WQwU7DMAyGn4V7Guj2BNsQJxBVx31yE1O8NknVOBtV1XcnSQcaJ3/+Y/92vJFluZVPD3D1hdJd0VMj5yOD6kSUTnMPptEg55dgFZOz4vBp77nC0ZD3MVsEgZFz7XpMDzlWric15bpMi/DbE3iP7OUuhZjLfVAd8h48Cj1ZME7HFT6gWX0yLAIGaoHxCpOcX/NONXreDZRn3fAZh95NBi0n9S6LH2qz2wqx3oVRYZ5Zje57+lVubiu/IX85naSVluWvU+TtkxvZNlW8Bx4C/2uPfHBWE+fjWKdRnv3jZVPKMh787ImKMVgmg7Je4w9zgOWrjQEAAA==
    Metadata:
      aws:cdk:path: CdkWorkshopStack/CDKMetadata/Default
    Condition: CDKMetadataAvailable
Outputs:
  Endpoint8024A810:
    Value:
      Fn::Join:
        - ""
        - - https://
          - Ref: EndpointEEF1FD8F
          - .execute-api.
          - Ref: AWS::Region
          - "."
          - Ref: AWS::URLSuffix
          - /
          - Ref: EndpointDeploymentStageprodB78BEEA0
          - /
  ViewHitCounterViewerEndpointCA1B1E4B:
    Value:
      Fn::Join:
        - ""
        - - https://
          - Ref: ViewHitCounterViewerEndpoint5A0EF326
          - .execute-api.
          - Ref: AWS::Region
          - "."
          - Ref: AWS::URLSuffix
          - /
          - Ref: ViewHitCounterViewerEndpointDeploymentStageprodF3901FC7
          - /
Conditions:
  CDKMetadataAvailable:
    Fn::Or:
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - af-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ca-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-northwest-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-2
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-3
          - Fn::Equals:
              - Ref: AWS::Region
              - il-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - me-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - me-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - sa-east-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-2
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-2
Parameters:
  BootstrapVersion:
    Type: AWS::SSM::Parameter::Value<String>
    Default: /cdk-bootstrap/hnb659fds/version
    Description: Version of the CDK Bootstrap resources in this environment, automatically retrieved from SSM Parameter Store. [cdk:skip]
Rules:
  CheckBootstrapVersion:
    Assertions:
      - Assert:
          Fn::Not:
            - Fn::Contains:
                - - "1"
                  - "2"
                  - "3"
                  - "4"
                  - "5"
                - Ref: BootstrapVersion
        AssertDescription: CDK bootstrap stack version 6 required. Please run 'cdk bootstrap' with a recent version of the CDK CLI.
```

```tsx
$ npm i cdk-dynamo-table-viewer // Update th package!
```

```tsx
...
✅  CdkWorkshopStack

✨  Deployment time: 83.43s

Outputs:
CdkWorkshopStack.Endpoint8024A810 = https://e258rzfuv7.execute-api.eu-central-1.amazonaws.com/prod/
CdkWorkshopStack.ViewHitCounterViewerEndpointCA1B1E4B = https://yx32do0nac.execute-api.eu-central-1.amazonaws.com/prod/
Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopStack/7050d110-9352-11ee-b818-02bc0e09f02f

✨  Total time: 86.04s
```

# Clean up your stack

When destroying a stack, resources may be deleted, retained, or snapshotted according to their deletion policy. By default, most resources will get deleted upon stack deletion, however that’s not the case for all resources. The DynamoDB table will be retained by default. If you don’t want to retain this table, we can set this in CDK code by using `RemovalPolicy`:

Set the DynamoDB table to be deleted upon stack deletion

Edit `hitcounter.ts` and add the `removalPolicy` prop to the table

```tsx
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
    // The function for which we want to count url hits
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

    // Allow accessing the counter func
    public readonly handler: lambda.Function; 

    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
            **removalPolicy: cdk.RemovalPolicy.DESTROY**
        });
        
        this.table = table;

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hitcounter.handler', 
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });

        // Grant the lambda role read/ write permissions to the table
        table.grantReadWriteData(this.handler);

        // Grant thr lambda role invoke permessions to the downstream function
        props.downstream.grantInvoke(this.handler);
    }
}
```

Additionally, the Lambda function created will generate CloudWatch logs that are permanently retained. These will not be tracked by CloudFormation since they are not part of the stack, so the logs will still persist. You will have to manually delete these in the console if desired.

Now that we know which resources will be deleted, we can proceed with deleting the stack. You can either delete the stack through the AWS CloudFormation console or use `cdk destroy`:

```
cdk destroy

```

You’ll be asked:

```
Are you sure you want to delete: CdkWorkshopStack (y/n)?

```

Hit “y” and you’ll see your stack being destroyed.

The bootstrapping stack created through `cdk bootstrap` still exists. If you plan on using the CDK in the future (we hope you do!) do not delete this stack.

If you would like to delete this stack, it will have to be done through the CloudFormation console. Head over to the CloudFormation console and delete the `CDKToolkit` stack. The S3 bucket created will be retained by default, so if you want to avoid any unexpected charges, be sure to head to the S3 console and empty + delete the bucket generated from bootstrapping.

# Testing Constructs

The [CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) has a good guide on testing constructs. For this section of the workshop we are going to use the [Fine-Grained Assertions](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained) and [Validation](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation) type tests.

### CDK assert Library

We will be using the CDK `assertions` (`aws-cdk-lib/assertions`) library throughout this section. The library contains several helper functions for writing unit and integration tests.

For this workshop we will mostly be using the `hasResourceProperties` function. This helper is used when you only care that a resource of a particular type exists (regardless of its logical identfier), and that *some* properties are set to specific values.

Example:

```tsx
template.hasResourceProperties('AWS::CertificateManager::Certificate', {
    DomainName: 'test.example.com',

    ShouldNotExist: Match.absent(),
    // Note: some properties omitted here
});
```

`Match.absent()` can be used to assert that a particular key in an object is *not* set (or set to `undefined`).

To see the rest of the documentation, please read the docs [here](https://docs.aws.amazon.com/cdk/api/latest/docs/assertions-readme.html).

### Fine-Grained Assertion Tests

**Create a test for the DynamoDB table**

> This section assumes that you have created hit counter construct
> 

Our `HitCounter` construct creates a simple DynamoDB table. Lets create a test that validates that the table is getting created.

If `cdk init` created a test directory for you, then you should have a `cdk-workshop.test.ts` file. Delete this file.

If you do not already have a `test` directory (usually created automatically when you run `cdk init`), then create a `test` directory at the same level as `bin` and `lib` and then create a file called `hitcounter.test.ts` with the following code.

```tsx
import { Template, Capture } from "aws-cdk-lib/assertions";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from "../lib/hitcounter";

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();
    // When...
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    });
    // Then...

    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
});
```

This test is simply testing to ensure that the synthesized stack includes a DynamoDB table.

Run the test.

```bash
npm run test
...
> cdk-workshop@0.1.0 test
> jest

 PASS  test/hitcounter.test.ts (9.742 s)
  ✓ DynamoDB Table Created (1317 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        10.296 s
Ran all test suites.
```

**Create a test for the Lambda function**

Now lets add another test, this time for the Lambda function that the `HitCounter` construct creates. This time in addition to testing that the Lambda function is created, we also want to test that it is created with the two environment variables `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Add another test below the DynamoDB test. If you remember, when we created the lambda function the environment variable values were references to other constructs.

```tsx
this.handler = new lambda.Function(this, 'HitCounterHandler', {
  runtime: lambda.Runtime.NODEJS_16_X,
  handler: 'hitcounter.handler',
  code: lambda.Code.fromAsset('lambda'),
  environment: {
    DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
    HITS_TABLE_NAME: table.tableName
  }
});
```

At this point we don’t really know what the value of the `functionName` or `tableName` will be since the CDK will calculate a hash to append to the end of the name of the constructs, so we will just use a dummy value for now. Once we run the test **it will fail and show us the expected value**.

```tsx
import { Template, Capture } from "aws-cdk-lib/assertions";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from "../lib/hitcounter";

test("Lambda Has Env Vars", () => {
    const stack = new cdk.Stack();
    //When
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    });
    // Then...
    const template = Template.fromStack(stack);
    const envCapture = new Capture();
    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture, 
    });

    expect(envCapture.asObject()).toEqual(
        {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {
                    Ref: "TestFunctionXXX", 
                },
                HITS_TABLE_NAME: {
                    Ref: "MyTestConstructHitsXXX",
                },
            },
        }
    );
});
```

```bash
npm run test
...
> cdk-workshop@0.1.0 test
> jest

 FAIL  test/hitcounter.test.ts (9.727 s)
  ✕ Lambda Has Env Vars (1678 ms)

  ● Lambda Has Env Vars

    expect(received).toEqual(expected) // deep equality

    - Expected  - 2
    + Received  + 2

      Object {
        "Variables": Object {
          "DOWNSTREAM_FUNCTION_NAME": Object {
    -       "Ref": "TestFunctionXXX",
    **+       "Ref": "TestFunction22AD90FC",**
          },
          "HITS_TABLE_NAME": Object {
    -       "Ref": "MyTestConstructHitsXXX",
    **+       "Ref": "MyTestConstructHits24A357F0",**
          },
        },
      }

      37 |     });
      38 |
    > 39 |     expect(envCapture.asObject()).toEqual(
         |                                   ^
      40 |         {
      41 |             Variables: {
      42 |                 DOWNSTREAM_FUNCTION_NAME: {

      at Object.<anonymous> (test/hitcounter.test.ts:39:35)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        10.036 s
Ran all test suites.
```

Grab the real values for the environment variables and update your test.

```tsx
import { Template, Capture } from "aws-cdk-lib/assertions";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from "../lib/hitcounter";

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();
    // When...
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    });
    // Then...

    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

test("Lambda Has Env Vars", () => {
    const stack = new cdk.Stack();
    //When
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    });
    // Then...
    const template = Template.fromStack(stack);
    const envCapture = new Capture();
    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture, 
    });

    expect(envCapture.asObject()).toEqual(
        {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {
                    // Ref: "TestFunctionXXX", 
                    Ref: "TestFunction22AD90FC",
                },
                HITS_TABLE_NAME: {
                    // Ref: "MyTestConstructHitsXXX",
                    Ref: "MyTestConstructHits24A357F0",
                },
            },
        }
    );
});
```

```bash
run npm test
...
➜  test git:(main) ✗ npm run test

> cdk-workshop@0.1.0 test
> jest

 PASS  test/hitcounter.test.ts
  **✓ DynamoDB Table Created (249 ms)
  ✓ Lambda Has Env Vars (31 ms)**

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.437 s, estimated 3 s
Ran all test suites.
```

You can also apply TDD (**Test Driven Development**) to developing CDK Constructs. For a very simple example, lets add a new requirement that our DynamoDB table be encrypted.

First we’ll update the test to reflect this new requirement.

```bash
import { Template, Capture } from "aws-cdk-lib/assertions";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from "../lib/hitcounter";

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();
    // When...
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hello.handler',
            code: lambda.Code.fromAsset('lambda')
        })
    });
    // Then...
    const template = Template.fromStack(stack);
    // template.resourceCountIs("AWS::DynamoDB::Table", 1);
    **template.hasResourceProperties('AWS::DynamoDB::Table', {
        SSESpecification: {
          SSEEnabled: true**
        }
    });
});
```

```bash
> cdk-workshop@0.1.0 test
> jest

 FAIL  test/hitcounter.test.ts
  ✕ DynamoDB Table Created (243 ms)

  ● DynamoDB Table Created

    Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.
    The 1 closest matches:
    MyTestConstructHits24A357F0 :: {
      "DeletionPolicy": "Delete",
      "Properties": {
        "AttributeDefinitions": [ { ... } ],
        "KeySchema": [ { ... } ],
        "ProvisionedThroughput": { ... },
    **!!   Missing key 'SSESpecification'**
        "SSESpecification": undefined
      },
      "Type": "AWS::DynamoDB::Table",
      "UpdateReplacePolicy": "Delete"
    }

      17 |     const template = Template.fromStack(stack);
      18 |     // template.resourceCountIs("AWS::DynamoDB::Table", 1);
    > 19 |     template.hasResourceProperties('AWS::DynamoDB::Table', {
         |              ^
      20 |         SSESpecification: {
      21 |           SSEEnabled: true
      22 |         }

      at Template.hasResourceProperties (node_modules/aws-cdk-lib/assertions/lib/template.js:1:3101)
      at Object.<anonymous> (test/hitcounter.test.ts:19:14)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        2.507 s, estimated 3 s
Ran all test suites.
```

Now lets fix the broken test. Update the hitcounter code to enable encryption by default.

```tsx
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface HitCounterProps {
    // The function for which we want to count url hits
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

    // Allow accessing the counter func
    public readonly handler: lambda.Function; 

    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
            **encryption: dynamodb.TableEncryption.AWS_MANAGED,**
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
        
        this.table = table;

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'hitcounter.handler', 
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });

        // Grant the lambda role read/ write permissions to the table
        table.grantReadWriteData(this.handler);

        // Grant thr lambda role invoke permessions to the downstream function
        props.downstream.grantInvoke(this.handler);
    }
}
```

Run build step to compile the changes.

```bash
npm run build 
npm run test
...
> cdk-workshop@0.1.0 test
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (1137 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        4.276 s
Ran all test suites.
```

### Validation Tests

Sometimes we want the inputs to be configurable, but we also want to put constraints on those inputs or validate that the input is valid.

Suppose for the `HitCounter` construct we want to allow the user to specify the `readCapacity` on the DynamoDB table, but we also want to ensure the value is within a reasonable range. We can write a test to make sure that the validation logic works: pass in invalid values and see what happens.

First, add a `readCapacity` property to the `HitCounterProps` interface:

```tsx
export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;

  /**
   * The read capacity units for the table
   *
   * Must be greater than 5 and lower than 20
   *
   * @default 5
   */
  readCapacity?: number;
}
```

Then update the DynamoDB table resource to add the `readCapacity` property.

```tsx
const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            **readCapacity: props.readCapacity ?? 5,** 
        });
```

Now add a validation which will throw an error if the readCapacity is not in the allowed range.

```tsx
constructor(scope: Construct, id: string, props: HitCounterProps) {
        **if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {**
            throw new Error('readCapacity must be greater than 5 and less than 20');
        }
        super(scope, id);

       ...
    }
```

Now lets add a test that validates the error is thrown.

```tsx
npm run build
npm run test 

> cdk-workshop@0.1.0 test
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (237 ms)
  ✓ read capacity can be configured (11 ms)
  ✓ Lambda Has Env Vars (40 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.407 s, estimated 3 s
Ran all test suites.
```

# CDK Pipelines

Now we will create a Continuous Deployment (CD) pipeline for the app developed in previous chapters.

CD is an important component in most web projects, but can be challenging to set up with all the moving parts required. The [CDK Pipelines](https://docs.aws.amazon.com/cdk/latest/guide/cdk_pipeline.html) construct makes that process easy and streamlined from within your existing CDK infrastructure design.

These pipelines consist of “stages” that represent the phases of your deployment process from how the source code is managed, to how the fully built artifacts are deployed.

### **Create Pipeline Stack**

The first step is to create the stack that will contain our pipeline. Since this is separate from our actual “production” application, we want this to be entirely self-contained.

Create a new file under `lib` called `lib/pipeline-stack.ts`. Add the following to that file.

```tsx
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        // Pipeline code goes here
    }
}
```

### Update CDK Deploy Entrypoint

Next, since the purpose of our pipeline is to deploy our application stack, we no longer want the main CDK application to deploy our original app. Instead, we can change the entry point to deploy our pipeline, which will in turn deploy the application.

To do this, edit the code in `bin/cdk-workshop.ts` as follows:

```tsx
import * as cdk from 'aws-cdk-lib';
import { WorkshopPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new WorkshopPipelineStack(app, 'CdkWorkshopPipelineStack');
```

And now we’re ready!

# Build a pipeline

**Create Repo in Pipeline Stack**

The first step in any good CD pipeline is source control. Here we will create a **[CodeCommit](https://aws.amazon.com/codecommit/)** repository to contain our project code.

Edit the file `lib/pipeline-stack.ts` as follows.

```tsx
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        // CodeCommit Repo
        new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: 'workshop',
        });

        // Pipeline code
    }
}
```

Deploy with `cdk deploy`

```tsx
✨  Synthesis time: 8.86s

CdkWorkshopPipelineStack:  start: Building 492776d86f04d56fc62f684e691acd338a6e92126b5db9c60738d6cc159a9be2:current_account-current_region
CdkWorkshopPipelineStack:  success: Built 492776d86f04d56fc62f684e691acd338a6e92126b5db9c60738d6cc159a9be2:current_account-current_region
CdkWorkshopPipelineStack:  start: Publishing 492776d86f04d56fc62f684e691acd338a6e92126b5db9c60738d6cc159a9be2:current_account-current_region
CdkWorkshopPipelineStack:  success: Published 492776d86f04d56fc62f684e691acd338a6e92126b5db9c60738d6cc159a9be2:current_account-current_region
CdkWorkshopPipelineStack: deploying... [1/1]
CdkWorkshopPipelineStack: creating CloudFormation changeset...

 ✅  CdkWorkshopPipelineStack

✨  Deployment time: 12.16s

Stack ARN:
arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopPipelineStack/65cb7220-959d-11ee-94dc-020350b800a1

✨  Total time: 21.02s
```

**Get Repo Info and Commit**

Before we can do anything with our repo, we must add our code to it!

**Git Credentials**

Before we can do that, we will need Git credentials for the repo. To do this, go to the [IAM Console](https://console.aws.amazon.com/iam), then navigate to `Users` and then click in the user name created earlier, `cdk-workshop`. Inside the manage user interface, navigate to the `Security credentials` tab and scroll until you see `HTTPS Git credentials for AWS CodeCommit`. Click generate credentials and follow the instructions on downloading those credentials. We will need them in a moment.

**Add Git remote**

The last console step we will need here is to navigate to the [CodeCommit Console](https://console.aws.amazon.com/codesuite/codecommit/repositories) and look for your repo. You will see a column called `Clone URL`; click `HTTPS` to copy the https link so we can add it to your local repo.

<aside>
❗ If you do not see your repo here, ensure you are in the interface for the correct region!

</aside>

In your terminal, first make sure that all the changes you have made during the workshop are committed by issuing `git status`. If you have unstaged or uncommitted changes, you can execute `git commit -am "SOME_COMMIT_MESSAGE_HERE"`. This will stage and commit all your files so you are ready to go!

Next, we add the remote repo to our Git config. You can do this with the command (*XXXXX* represents the Clone URL you copied from the console):

```tsx
// git remote add origin XXXXX 
...
git remote add codecommit https://git-codecommit.eu-central-1.amazonaws.com/v1/repos/workshop
```

<aside>
⚠️ Read on how to switch b/ween remotes if you want to have this code on github and codecommit with adding a remote `git remote add <remote_name> <remote_url>` + listing existing remotes with `git remote -v`

</aside>

```tsx
git remote -v // List remotes 
git push --set-upstream codecommit // -> Here, CodeCommit will request the credentials you generated in the Git Credentials section. You will only have to provide them once.
```

Now you can return to the CodeCommit console and see that your code is all there!

### Define an Empty Pipeline

Now we are ready to define the basics of the pipeline.

Return to the file `lib/pipeline-stack.ts` and edit as follows:

```tsx
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        // CodeCommit Repo
        const repo = new codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: 'workshop',
        });

        // Basic pipeline declaration, sets the initial structure of the pipeline
        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'WorkshopPipeline', 
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.codeCommit(repo, 'main'),
                installCommands: [
                    'npm install -g aws-cdk'
                ],
                commands: [
                    'npm ci',
                    'npm run build',
                    'npx cdk synth', // cdk synth
                ]
            })
        });
    }
}
```

**Component Breakdown**

The above code does several things:

- `new CodePipeline(...)`: This initializes the pipeline with the required values. This will serve as the base component moving forward. Every pipeline requires at bare minimum:
    - `synth(...)`: The `synthAction` of the pipeline describes the commands necessary to install dependencies, build, and synth the CDK application from source. This should always end in a *synth* command, for NPM-based projects this is always `npx cdk synth`.
    - The `input` of the synth step specifies the repository where the CDK source code is stored.
    
    ### Deploy Pipeline and See Result
    
    All that’s left to get our pipeline up and running is to commit our changes and run one last cdk deploy.
    
    ```bash
    git add .
    git commit -m "Deploy workshop pipeline" && git push
    cdk deploy
    ... 
    Do you wish to deploy these changes (y/n)? y
    CdkWorkshopPipelineStack: deploying... [1/1]
    CdkWorkshopPipelineStack: creating CloudFormation changeset...
    ...
    ✅  CdkWorkshopPipelineStack
    
    ✨  Deployment time: 141.63s
    
    Stack ARN:
    arn:aws:cloudformation:eu-central-1:458036673695:stack/CdkWorkshopPipelineStack/65cb7220-959d-11ee-94dc-020350b800a1
    
    ✨  Total time: 153.97s
    ```
    
    CDK Pipelines auto-update for each commit in a source repo, so this is the *last time* we will need to execute this command!
    
    Once deployment is finished, you can go to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and you will see a new `WorkshopPipeline` pipeline! 
    
    To check the workflow of the pipeline you can run:
    
    ```bash
    git add . && git commit -m "Check autoupdate CDK pipeline" && git push
    ```
    
    ![Screenshot 2023-12-08 at 10.56.16.png](AWS%20CDK%20cc582c44599a460599be0f6bdc90db6f/Screenshot_2023-12-08_at_10.56.16.png)
    
    ### Create Stage
    
    At this point, you have a fully operating CDK pipeline that will automatically update itself on every commit, *BUT* at the moment, that is all it does. We need to add a stage to the pipeline that will deploy our application.
    
    Create a new file in `lib` called `pipeline-stage.ts` with the code below:
    
    ```bash
    import { CdkWorkshopStack } from "./cdk-workshop-stack";
    import { Stage, StageProps } from "aws-cdk-lib";
    import { Construct } from "constructs";
    
    export class WorkshopPipelineStage extends Stage {
        constructor(scope: Construct, id: string, props?: StageProps) {
            super(scope, id, props);
    
            new CdkWorkshopStack(this, 'WebServicce'); // Will be an error here!
        }
    
    }
    ```
    
    All this does is declare a new `Stage` (component of a pipeline), and in that stage instantiate our application stack.
    
    Now, at this point your code editor may be telling you that you are doing something wrong. This is because the application stack as it stands now is not configured to be deployed by a pipeline. Open `lib/cdk-workshop-stack.ts` and make the following changes:
    
    ```bash
    import * as cdk from 'aws-cdk-lib';
    import* as lambda from 'aws-cdk-lib/aws-lambda';
    import * as apigw from 'aws-cdk-lib/aws-apigateway';
    import { HitCounter } from './hitcounter';
    import { TableViewer } from 'cdk-dynamo-table-viewer';
    import { Construct } from 'constructs';
    
    export class CdkWorkshopStack extends cdk.Stack {
      **constructor(scope: Construct, id: string, props?: cdk.StackProps) {**
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
    ```
    
    This stack’s `scope` parameter was defined as being a `cdk.App`, which means that in the construct tree, it must be a child of the app. Since the stack is being deployed by the pipeline, it is no longer a child of the app, so its type must be changed to `Construct`.
    
    ### Add stage to pipeline
    
    Now we must add the stage to the pipeline by adding the following code to `lib/pipeline-stack.ts`:
    
    ```bash
    import * as cdk from 'aws-cdk-lib';
    import * as codecommit from 'aws-cdk-lib/aws-codecommit';
    import { Construct } from 'constructs';
    import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
    import { WorkshopPipelineStage } from './pipeline-stage';
    
    export class WorkshopPipelineStack extends cdk.Stack {
        constructor(scope: Construct, id: string, props?: cdk.StackProps) {
            super(scope, id, props);
            
            // CodeCommit Repo
            const repo = new codecommit.Repository(this, 'WorkshopRepo', {
                repositoryName: 'workshop',
            });
    
            // Basic pipeline declaration, sets the initial structure of the pipeline
            const pipeline = new CodePipeline(this, 'Pipeline', {
                pipelineName: 'WorkshopPipeline', 
                synth: new CodeBuildStep('SynthStep', {
                    input: CodePipelineSource.codeCommit(repo, 'main'),
                    installCommands: [
                        'npm install -g aws-cdk'
                    ],
                    commands: [
                        'npm ci',
                        'npm run build',
                        'npx cdk synth', // why not a cdk synth ?
                    ]
                })
            });
    
            **const deploy = new WorkshopPipelineStage(this, 'Deploy');
            const deployStage = pipeline.addStage(deploy);**
        }
    }
    ```
    
    This imports and creates an instance of the `WorkshopPipelineStage`. Later, you might instantiate this stage multiple times (e.g. you want a Production deployment and a separate development/test deployment).
    
    Then we add that stage to our pipeline (`pipeline.addStage(deploy);`). A Stage in a CDK Pipeline represents a set of one or more CDK Stacks that should be deployed together, to a particular environment.
    
    **Commit and deploy** 
    
    Now that we have added the code to deploy our application, all that’s left is to commit and push those changes to the repo.
    
    ```bash
    git add .  
    git commit -am "Add deploy stage to pipeline" && git push
    ```
    
    Once that is done, we can go back to the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines) and take a look as the pipeline runs (this may take a while).
    
    ![Screenshot 2023-12-08 at 12.32.58.png](AWS%20CDK%20cc582c44599a460599be0f6bdc90db6f/Screenshot_2023-12-08_at_12.32.58.png)
    
    ### Polish pipeline
    
    **Get Endpoints**
    
    Stepping back, we can see a problem now that our app is being deployed by our pipeline. There is no easy way to find the endpoints of our application (the `TableViewer` and `APIGateway` endpoints), so we can’t call it! Let’s add a little bit of code to expose these more obviously.
    
    First edit `lib/cdk-workshop-stack.ts` to get these values and expose them as properties of our stack:
    
    ```bash
    import * as cdk from 'aws-cdk-lib';
    import * as lambda from 'aws-cdk-lib/aws-lambda';
    import * as apigw from 'aws-cdk-lib/aws-apigateway';
    import { HitCounter } from './hitcounter';
    import { TableViewer } from 'cdk-dynamo-table-viewer';
    import { Construct } from 'constructs';
    import { AlarmStatusWidgetSortBy } from 'aws-cdk-lib/aws-cloudwatch';
    
    export class CdkWorkshopStack extends cdk.Stack {
      **public readonly hcViewerUrl: cdk.CfnOutput;
      public readonly hcEndpoint: cdk.CfnOutput;**
    
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
    
        // API Gateway
        **const gateway = new apigw.LambdaRestApi(this, 'Endpoint', {**
          handler: helloWithCounter.handler
        })
    
        **const tv = new TableViewer(this, 'ViewHitCounter', {**
          title: 'Hello hits',
          table: helloWithCounter.table,
          sortBy: '-hits'
        });
    
        **this.hcEndpoint = new cdk.CfnOutput(this, 'GatewayUrl', {
          value: gateway.url
        });
    
        this.hcViewerUrl = new cdk.CfnOutput(this, 'TableViewerUrl', {
          value: tv.endpoint
        });**
      }
    }
    ```
    
    By adding outputs `hcViewerUrl` and `hcEnpoint`, we expose the necessary endpoints to our HitCounter application. We are using the core construct `CfnOutput` to declare these as Cloudformation stack outputs (we will get to this in a minute).
    
    Let’s commit these changes to our repo (`git add . && git commit -am "MESSAGE" && git push`), and navigate to the [Cloudformation console](https://console.aws.amazon.com/cloudformation). You can see there are three stacks.
    
    - `CDKToolkit`: The first is the integrated CDK stack (you should always see this on bootstrapped accounts). You can ignore this.
    - `WorkshopPipelineStack`: This is the stack that declares our pipeline. It isn’t the one we need right now.
    - `Deploy-WebService`: Here is our application! Select this, and under details, select the `Outputs` tab. Here you should see four endpoints (two pairs of duplicate values). Two of them, `EndpointXXXXXX` and `ViewerHitCounterViewerEndpointXXXXXXX`, are defaults generated by Cloudformation, and the other two are the outputs we declared ourselves.
    
    ![Screenshot 2023-12-08 at 12.54.09.png](AWS%20CDK%20cc582c44599a460599be0f6bdc90db6f/Screenshot_2023-12-08_at_12.54.09.png)
    
    If you click the `TableViewerUrl` value, you should see our pretty hitcounter table that we created in the initial workshop. If you don’t see this endpoint yet, you have to wait before the creation of the resources will be ended. If the table is empty, click on the `EndpointXXX` and generate different hit paths. 
    
    ![Screenshot 2023-12-08 at 13.06.43.png](AWS%20CDK%20cc582c44599a460599be0f6bdc90db6f/Screenshot_2023-12-08_at_13.06.43.png)
    
    **Add Validation Test**
    
    Now we have our application deployed, but no CD pipeline is complete without tests!
    
    **Let’s start with a simple test to ping our endpoints to see if they are alive.** Return to `lib/pipeline-stack.ts` and add the following:
    
    ```bash
    mport * as cdk from 'aws-cdk-lib';
    import * as codecommit from 'aws-cdk-lib/aws-codecommit';
    import { Construct } from 'constructs';
    import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
    import { WorkshopPipelineStage } from './pipeline-stage';
    
    export class WorkshopPipelineStack extends cdk.Stack {
        constructor(scope: Construct, id: string, props?: cdk.StackProps) {
            super(scope, id, props);
    		     
    				// Repo and pipeline code here 
    				...
            
    				**const deploy = new WorkshopPipelineStage(this, 'Deploy');
            const deployStage = pipeline.addStage(deploy);
    
            // Ping endpoints
            deployStage.addPost(
                new CodeBuildStep('TestViewerEndpoint', {
                    projectName: 'TestViewerEndpoint', 
                    envFromCfnOutputs: {
                        ENDPOINT_URL: //
                    },
                    commands: [
                        'curl -Ssf $ENDPOINT_URL'
                    ]
                }),
    
                new CodeBuildStep('TestAPIgatewayEndpoint', {
                    projectName: 'TestAPIgatewayEndpoint',
                    envFromCfnOutputs: {
                        ENDPOINT_URL: // 
                    },
                    commands: [
                        'curl -Ssf $ENDPOINT_URL',
                        'curl -Ssf $ENDPOINT_URL/hello',
                        'curl -Ssf $ENDPOINT_URL/world'
                    ]
                })
            )**
        }
    }
    ```
    
    We add post-deployment steps via `deployStage.addPost(...)` from CDK Pipelines. We add two actions to our deployment stage: to test our TableViewer endpoint and our APIGateway endpoint, respectively.
    
    <aside>
    ⚠️ We submit several curl requests to the APIGateway endpoint so that when we look at our tableviewer, there are several values already populated.
    
    </aside>
    
    **You may notice that we have not yet set the URLs of these endpoints. This is because they are not yet exposed to this stack!**
    
    With a slight modification to `lib/pipeline-stage.ts` we can expose them:
    
    ```tsx
    import { CdkWorkshopStack } from "./cdk-workshop-stack";
    import { CfnOutput, Stage, StageProps } from "aws-cdk-lib";
    import { Construct } from "constructs";
    
    export class WorkshopPipelineStage extends Stage {
        **public readonly hcViewerUrl: CfnOutput;
        public readonly hcEndpoint: CfnOutput;**
    
        constructor(scope: Construct, id: string, props?: StageProps) {
            super(scope, id, props);
    
            **const service = new CdkWorkshopStack(this, 'WebServicce');
    
            this.hcEndpoint = service.hcEndpoint;
            this.hcViewerUrl = service.hcViewerUrl;**
        }
    }
    ```
    
    Now we can add those values to our actions in `lib/pipeline-stack.ts` by getting the `stackOutput` of our pipeline stack:
    
    ```tsx
    deployStage.addPost(
                new CodeBuildStep('TestViewerEndpoint', {
                    projectName: 'TestViewerEndpoint', 
                    envFromCfnOutputs: {
                        **ENDPOINT_URL: deploy.hcViewerUrl**
                    },
                    commands: [
                        'curl -Ssf $ENDPOINT_URL'
                    ]
                }),
    
                new CodeBuildStep('TestAPIgatewayEndpoint', {
                    projectName: 'TestAPIgatewayEndpoint',
                    envFromCfnOutputs: {
                        **ENDPOINT_URL: deploy.hcEndpoint**
                    },
                    commands: [
                        'curl -Ssf $ENDPOINT_URL',
                        'curl -Ssf $ENDPOINT_URL/hello',
                        'curl -Ssf $ENDPOINT_URL/world'
                    ]
                })
            )
    ```
    
    Congratulations! You have successfully created a CD pipeline for your application complete with tests and all! Feel free to explore the console to see the details of the stack created, or check out the [API Reference](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) section on CDK Pipelines and build one for your application.
    
    # Cleanup
    
    To clean up the stacks from this workshop, navigate to the [Cloudformation Console](https://console.aws.amazon.com/cloudformation), select your stacks, and hit “Delete”. This may take some time.