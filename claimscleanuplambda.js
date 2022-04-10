const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    const listTableParams = {};
    let ephemeralClaims = {};

	console.log('Getting Claim Tables');
	while (true) {
		const listTablesResponse = await dynamodb.listTables(listTableParams).promise();
		for (const index in listTablesResponse.TableNames) {
			const tableName = listTablesResponse.TableNames[index];
			console.log('Checking if ' + tableName + ' is a claims table');
			if (tableName.includes('ClaimsTable') && tableName != 'RemoveClaimsTable') {
				console.log(tableName + ' is a claim table');
				ephemeralClaims[tableName] = [];
			}
		}

		if (undefined === listTablesResponse.LastEvaluatedTableName) {
			break;
		}
		else {
			listTableParams.ExclusiveStartTableName = listTablesResponse.LastEvaluatedTableName;
		}
	}

	console.log('Waiting for Tables List to Finish');
	await new Promise(resolve => setTimeout(resolve, 2000));
	console.log('Finished Waiting');

    let response = undefined;
    for (const tableName in ephemeralClaims) {
        console.log(JSON.stringify('Getting non-permanent claims for ' + tableName));
        const params = {
            TableName: tableName,
            FilterExpression: 'username <> :undef and #p = :f',
            ExpressionAttributeNames: {
                '#p': 'is-permanent',
            },
            ExpressionAttributeValues: {
                ':undef': {'S': 'UNDEFINED'},
                ':f': {'BOOL': false},
            }
        };

        console.log('Scanning table with following params: ' + JSON.stringify(params));
        await dynamodb.scan(params, function(err, data) {
            if (err) {
                console.log(err);
                response = {
                    statusCode: 500,
                    body: err,
                };
            }
            else {
                if (data['Items'].length == 0) {
                    console.log('No non-permanent claims found');
                }
                else {
                    console.log('Successfully retrieved non-permanent claim data in ' + tableName + ': ' + JSON.stringify(data));
                    for (const index in data.Items) {
                        ephemeralClaims[tableName].push(data.Items[index]['pokemon']['S'])
                    }
                }
            }
        }).promise();
    }

    console.log('Claims To Delete: ' + JSON.stringify(ephemeralClaims));

    for (const tableName in ephemeralClaims) {
        const claimedPokemon = ephemeralClaims[tableName];
        for (const index in claimedPokemon) {
            const pokemonName = claimedPokemon[index];
            const payload = {
                "table-name": tableName,
                "pokemon": pokemonName
            }
            const removeClaimsParams = {
                FunctionName: 'ClaimTablesRemoveClaimLambda',
                InvocationType: 'RequestResponse',
                LogType: 'Tail',
                Payload: JSON.stringify(payload),
            };
        
            console.log('Invoking Delete Claims Lambda with parameters ' + JSON.stringify(removeClaimsParams));
            await lambda.invoke(removeClaimsParams, function(err, data) {
                if (err) {
                    console.log('Lambda Invoke Error: ' + err);
                    response = {
                        statusCode: 500,
                        body: err,
                    };
                }
                else {
                    console.log('Successfully deleted claim for ' + pokemonName + ' in ' + tableName + ': ' + JSON.stringify(data));
                }
            }).promise();
    
            if (response != undefined) {
                console.log('Error Detected. Breaking');
                break;
            }
        }
    }

    if (response == undefined) {
        return {
            statusCode: 200,
            body: 'Successfully Cleaned Non-Permanent Claims'
        }
    }

    return response;
};
