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
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
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
