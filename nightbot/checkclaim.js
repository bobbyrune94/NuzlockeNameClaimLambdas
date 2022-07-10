/*
* INPUT <json object> response --- the response to the ClaimTablesGetPokemonClaimLambda
* INPUT <string> pokemon --- the name of the pokemon being checked
* OUTPUT <string> --- the nickname associated with the pokemon, or error message if there was one
*/

if (response['statusCode'] == 500 ) {
    'Error Getting Data. DM @Kungfu_Kenny98 to see what the error was'
}
else if (response['statusCode'] == 404 ) {
    'Invalid Pokemon. Please check your spelling. For some special names, check here: https://www.pokeclaim.com/about#About-details'
}
else if (response['body']['discord-id'] == 'UNDEFINED') {
    pokemon + ' has not been claimed';
}
else {
    pokemon + ' was claimed by ' + response['body']['discord-username'] + ': ' + response['body']['nickname']
}