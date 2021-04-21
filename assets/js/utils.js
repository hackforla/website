/**
 * Event Listener `locationchange` that gets triggered on
 *      - history.pushState
 *      - history.replaceState
 *      - window.popstate
 */
 history.pushState = ( f => function pushState(){
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
 })(history.pushState);

 history.replaceState = ( f => function replaceState(){
     var ret = f.apply(this, arguments);
     window.dispatchEvent(new Event('replacestate'));
     window.dispatchEvent(new Event('locationchange'));
     return ret;
 })(history.replaceState);

 window.addEventListener('popstate',()=>{
     window.dispatchEvent(new Event('locationchange'))
 });



/**
 * Returns Time Zone Text
*/
function timeZoneText(){
    let timeZone = undefined;
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ;
    return timeZone ? `Times are in your local time zone: ${timeZone}` : 'Times are in your local time zone';
}