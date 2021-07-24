/**
 * Function that performs pagination of an api, then processes the results of each page of an api call to isolate the relevant data.
 * @param {Function} apicall a function that performs an apicall given a payload
 * @param {Object} payload a object of key-value pairs representing the payload of the apicall
 * @param {Function} processor a function that combs through the results of the apicall function and returns only the relevant data from the results. If the apicall returns false, perhaps by the failure function, the processor will not run.
 * Note: to work properly, the processor function at **MINIMUM** has to **return falsy when the pagination needs to stop**. Otherwise, paginate will endlessly loop through all the pages.
 * @param {String} pageVar the name of the key that sets the page number in the payload, default 'page'
 * @param {Number} startPage the page number to start the apicall, default 1
 * @param {Number} stopPage the page number after the startPage to end the api call, default 100
 * @param {Function} failure determins the result an error after catching errors in the apicall function, defaults to throwing the error. If configured to return the boolean true, the pagination will continue in spite of the failed api call.
 * @returns a recursive function that itself returns an Array of the processed results by page
 */
 async function paginatePage({ apicall, payload, processor, pageVar = 'page', startPage = 1, stopPage = 100, failure = err => { throw new Error(err) }}) {

    // Cache calculated endpage to improve efficiency.
    const endpage = startPage + stopPage

    /**
     * An inner helper function that recursively performs pagination across the api in the apicall variable within paginate function's scope
     * @param {Number} pageNum starting page for pagination
     * @param {Array} store an empty array for caching the results as the function recurs
     * @returns store if stopPage or the processor's false condition is met, else calls itself
     */
    async function helper(pageNum, store = []) {

        // An emergency stopper to return the processed pages early to prevent an infinite loop recursion. By default, returns after the first 100 pages.
        if (pageNum == endpage) {
            console.error(`You have reached the emergency stop to prevent infinite loops. You are stopped on page, ${endpage} after caching ${stopPage} pages. To go beyond this, set the stopPage key in the parameter to cache more pages.`);
            return store
        }

        // Sets the payload to be the next page and performs the api call.
        payload[pageVar] = pageNum;
        const results = await performAPICall(apicall, payload, processor, failure);

        // If performAPICall returns true by way of the failure function, continue with the next page. Note that failure, by default, re-throws the caught error, and stops the script entirely.
        if (results === true) {
            return helper(++pageNum, store);
        }

        // Results of processing the outcome of the APICall. If the processor determines there is no more data to be found, returning true will stop the pagination recursion and returns the processed pages.
        if (results) {
            store.push({
                page: pageNum,
                result: results
            });
            return helper(++pageNum, store);
        } else {
            return store;
        }
    }

    return await helper(startPage);
}

/**
 * Helper function: Performs and returns the results of an api call or the results of error catching.
 * @param {Function} apicall a function that performs an apicall
 * @param {Object} payload a object of key-value pairs representing the api payload
 * @returns the results of the api call with the given payload
 */
async function performAPICall(apicall, payload, processor, failure) {
    try {
        const results = await apicall(payload);
        return processor(results);
    } catch (err) {
        return failure(err);
    }
}

module.exports = {
    paginatePage
}