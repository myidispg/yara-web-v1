/**
 * Turns an axios error into a message describing what actually went wrong.
 * Never blame the user's credentials unless the server actually rejected them.
 */
export function describeApiError(err) {
  // No response = the request never got a reply:
  // offline, DNS failure, redirect loop, CORS block, or timeout.
  if (!err || !err.response) {
    if (err?.code === "ECONNABORTED") {
      return "The server took too long to respond. Please try again.";
    }
    return "Can't reach the server. Check your connection and try again.";
  }

  const { status, data } = err.response;

  // Pull a readable message out of whatever shape the backend sent.
  let serverMessage = null;
  if (data) {
    if (typeof data === "string") {
      // Django sometimes returns an HTML error page — don't dump that on the user.
      if (!data.trim().startsWith("<")) serverMessage = data.slice(0, 200);
    } else if (typeof data.detail === "string") {
      serverMessage = data.detail;
    } else if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
      serverMessage = String(data.non_field_errors[0]);
    } else if (typeof data.error === "string") {
      serverMessage = data.error;
    }
  }

  if (status === 400 || status === 401) {
    return serverMessage || "Incorrect email/phone or password.";
  }
  if (status === 403) {
    return serverMessage || "This account does not have staff access.";
  }
  if (status === 404) {
    return "The login service wasn't found. Please contact support.";
  }
  if (status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (status >= 500) {
    return serverMessage || "Server error. Please try again in a moment.";
  }

  return serverMessage || `Unexpected error (${status}). Please try again.`;
}