/**
 * Function that performs pagination of an api, then processes the results of each page of an api call to isolate the relevant data.
 * @param {Function} apicall a function that performs an apicall given a payload
 * @param {Object} payload an Object of key-value pairs representing the payload of the apicall
 * @param {Function} processor a function that combs through the results of the apicall function and returns only the relevant data from the results.
 * @param {String} pageVar the name of the key that sets the page number in the payload, default 'page'
 * @param {Number} startPage the page number to start the apicall, default 1
 * @param {Number} stopPage the page number after the startPage to end the api call, default 100
 * @param {Function} failure a function that takes the catched error of the apicall function, defaults to throwing the error.
 * @returns a recursive helper function that itself returns an Array of Objects containing the number of each page and its processed results
 * Note: The processor and failure function are both ways of handling what happens to the paginatePage function after running the apicall function. If either of them return the boolean true, the recursion continues without storing the results. If either of them return truthy, the returned item will be stored before the recursion continues. Finally, if either of them return false, the stored results are returned.
 */
async function paginatePage({ apicall, payload, processor, pageVar = 'page', startPage = 1, stopPage = 100, failure = err => { throw new Error(err) } }) {

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

        // Results of processing the outcome of the APICall. If the processor determines there is no more data to be found, returning true will stop the pagination recursion and returns the processed pages.
        if (results === true) {
            return helper(++pageNum, store);
        } else if (results) {
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
 * @param {Function} processor a function that combs through the results of the apicall function and returns only the relevant data from the results.
 * @param {Function} failure a function that catches errors in either the apicall function or the processor function
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