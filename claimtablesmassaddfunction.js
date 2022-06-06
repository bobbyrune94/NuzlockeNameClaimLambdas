const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    const tableName = event['table-name'];
    const nextChangeDate = event['next-change-date'];
    
    for (const claim of event['claims']) {
        const discordId = claim['discord-id'];
        const discordUser = claim['discord-username'];
        const pokemon = claim['pokemon'].toLowerCase();
        const nickname = claim['nickname'];
        const isPermanent = claim['is-permanent'];
        
    	const addClaimLambdaParams = {
    		FunctionName: 'ClaimTablesAddClaimLambda',
    		InvocationType: 'RequestResponse',
    		LogType: 'Tail',
    		Payload: '{ "table-name": "' + tableName + '", "discord-id": "' + discordId + '", "discord-username": "' + discordUser + '", "pokemon": "' 
    		+ pokemon + '", "nickname": "' + nickname + '", "next-change-date": "' + nextChangeDate + '", "is-permanent": ' + isPermanent + ' }',
    	};
    
    	console.log('Invoking Claim Table Add Function with parameters ' + JSON.stringify(addClaimLambdaParams));
    	await lambda.invoke(addClaimLambdaParams, function(err, data) {
    		if (err) {
    			console.log('Lambda Invoke Error: ' + err);
    		}
    		else {
    			console.log('Successfully added claim to claims table ' + tableName + ': ' + data);
    		}
    	}).promise();
    }
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('All claims successfully added!'),
    };
    return response;
};
