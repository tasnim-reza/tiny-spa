function httpService(requestMethod, url, data, successCallback, errorCallback) {
    var client = new XMLHttpRequest();

    client.addEventListener("progress", updateProgress);
    client.addEventListener("load", transferComplete);
    client.addEventListener("error", errorCallback);
    client.addEventListener("abort", transferCanceled);

    var async = true,
        username = null,
        password = null;

    data = (requestMethod.toUpperCase() === 'GET' || requestMethod.toUpperCase() === 'HEAD') ? null : data;

    client.open(requestMethod, url, async, username, password);
    client.send(data);

    //--

    // progress on transfers from the server to the client (downloads)
    function updateProgress(oEvent) {
        console.log("in progress");
        if (oEvent.lengthComputable) {
            var percentComplete = oEvent.loaded / oEvent.total;
            // ...
        } else {
            // Unable to compute progress information since the total size is unknown
        }
    }

    function transferComplete(evt) {
        console.log("The transfer is complete.");
        successCallback(client.responseText);
    }

    function transferFailed(evt) {
        console.log("An error occurred while transferring the file.");

    }

    function transferCanceled(evt) {
        console.log("The transfer has been canceled by the user.");
    }

}

