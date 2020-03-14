//User submits form
$('#graphForm').submit(function () {
    console.log("User submitted!");

    responseArray = $('#graphForm').serializeArray();

    //Check for required responses
    num = 4
    if(responseArray.length < num)
    {
        alert("Must select atleast one option in each field to build a visualization. You are currently missing " + (num - responseArray.length)  + "!");
        return false;
    }

    for(num in responseArray)
    {
        console.log(responseArray[num]['value']);
    }

    return false;
});