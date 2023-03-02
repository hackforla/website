
// assignees is an arrays of `login`'s
function isTimelineOutdated(timeline, issueNum, assignees) {
  // track the most recent event that assigned one of the assignees
  let lastAssigned = null;
  let lastCommentOutdated = false;
  // timeline is an array of issue events (objects), in chronological order
  // loop through the timeline array from the end--checking the most recent events first
  for (let i = timeline.length - 1; i >= 0; i--) {
    const issueEvent = timeline[i];
    // each event object has a property of 'event' that has the value of the event type
    const issueEventType = issueEvent.event;

    if (issueEventType === 'cross-referenced' || (issueEventType === 'commented' && isCommentByAssignees(issueEvent, assignees))) {
      // if such event is found, check how recent it is
      // each event object has a 'created_at' property and an 'updated_at' property, set the timestamp to the most recent one
      const eventTimestamp = issueEvent.updated_at ? issueEvent.updated_at : issueEvent.created_at;
      // when a recent comment or cross-reference is found, immediately return 
      if (isMomentRecent(eventTimestamp, sevenDayCutoffTime)) {
        return {result: false, labels: statusUpdatedLabel}
      }
      // when a relatively recent comment or cross-reference is found, immediately return
      else if (isMomentRecent(eventTimestamp, fourteenDayCutoffTime)) {
        return {result: true, labels: toUpdateLabel}
      }
      // when a comment or cross-reference is found and it's outdated, set lastCommentOutdated to true, and continue the loop
      else {
        lastCommentOutdated = true;
      }
    }

    // store the most recent time when an assignee got assigned
    if (lastAssigned === null && (issueEventType === 'assigned' && assignees.includes(issueEvent.actor.login))) {
      lastAssigned = issueEvent.created_at;
    }
  }

  // the code below gets executed if the loop exits without returning, it means no 'cross-referenced' or 'commented' by an assignee was found within 14 days, so first check when issue was most recently assigned to one of the assignees
  // if lastAssigned !== null, check the time when assignee was assigned against the cutoff times
  if (lastAssigned) {
    // if assigned within 7 days, no label is needed 
    if (isMomentRecent(lastAssigned, sevenDayCutoffTime)) {
      return {result: false, labels: ''}
    }
    // if assigned within 14 days yet no recent comment, add `To Update !` label
    else if (isMomentRecent(lastAssigned, fourteenDayCutoffTime)) {
      return {result: true, labels: toUpdateLabel}
    }
  }
  
  // the code below gets executed if the previous conditions are not met, it's because lastAssigned was 14 days ago, and no comment or cross-reference was found within 14 days
  return {result: true, labels: inactiveLabel}
}

// when called, this function loops through all issues in the `In Progress` column of the Project Board
async function main({ g, c }, columnId) {
	github = g;
	context = c;
	// Retrieve all issue numbers from a column
	const issueNums = getIssueNumsFromColumn(columnId);
	for await (let issueNum of issueNums) {
		const assignees = await getAssignees(issueNum);
		// Error catching.
		if (assignees.length === 0) {
		  console.log(`Assignee not found, skipping issue #${issueNum}`)
		  continue
		}
    // get events timeline of the issue
    const timeline = await getTimeline(issueNum);
		
		// Add and remove labels as well as post comment if the issue's timeline indicates the issue is inactive, to be updated or up to date accordingly 
    // responseObject has two properties: {result: true/false, labels: [string]}
		const responseObject = await isTimelineOutdated(timeline, issueNum, assignees)

		if (responseObject.result === true && responseObject.labels === toUpdateLabel) { // Outdated, add toUpdateLabel
			console.log(`Going to ask for an update now for issue #${issueNum}`);
			await removeLabels(issueNum, statusUpdatedLabel, inactiveLabel);  
			await addLabels(issueNum, responseObject.labels); 
			await postComment(issueNum, assignees, toUpdateLabel);
		} else if (responseObject.result === false && responseObject.labels === statusUpdatedLabel) { // Not outdated, add statusUpdatedLabel
			await removeLabels(issueNum, toUpdateLabel, inactiveLabel);
			await addLabels(issueNum, responseObject.labels);
		} else if (responseObject.result === true && responseObject.labels === inactiveLabel) { // Outdated, add inactiveLabel
			console.log(`Going to ask for an update now for issue #${issueNum}`);
			await removeLabels(issueNum, toUpdateLabel, statusUpdatedLabel);
			await addLabels(issueNum, responseObject.labels);
			await postComment(issueNum, assignees, inactiveLabel);
		} else if (responseObject.result === false && responseObject.labels === '') { // Not outdated, but not updated either, remove all update-related labels
			console.log(`No updates needed for issue #${issueNum}`);
			await removeLabels(issueNum, toUpdateLabel, inactiveLabel, statusUpdatedLabel);
			await addLabels(issueNum, responseObject.labels);
		}
	}
}	