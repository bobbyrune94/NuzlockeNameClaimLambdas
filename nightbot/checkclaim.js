if (response['statusCode'] == 500 ) {
    `Error Getting Data. DM @Kungfu_Kenny98 to see what the error was`
}
else if (response['statusCode'] == 404 ) {
    `Invalid Pokemon. Please check your spelling. For some special names, check here: https://www.pokeclaim.com/about#About-details`
}
else if (response['body']['discord-id'] == 'UNDEFINED') {
    `$(1) has not been claimed`;
}
else {
    `$(1) was claimed by ${response['body']['discord-username']}: ${response['body']['nickname']}`
}