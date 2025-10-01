/**
 * Returns the current date and time in Los Angeles time (PST/PDT)
 * formatted as a string.
 *
 * The output format is: `YYYY/MM/DD HH:MM TZ`, where `TZ` is either
 * PST or PDT depending on daylight saving time.
 *
 * @returns {string} Formatted timestamp in Los Angeles local time.
 *
 * @example
 * const timestamp = getLATimestamp();
 * console.log(timestamp); // "2025/09/02 12:38 PDT"
 */
function getLATimestamp() {
  // Create notification time string in PST/PDT
  return new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
}

module.exports = getLATimestamp;
