import { useState, useMemo } from "react";

interface StatusCode {
  code: number;
  name: string;
  description: string;
  detail: string;
}

const CODES: StatusCode[] = [
  // 1xx
  { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed.", detail: "The server has received the request headers and the client should proceed to send the request body. This is used when the client first sends a request with an Expect: 100-continue header." },
  { code: 101, name: "Switching Protocols", description: "The server agrees to switch protocols.", detail: "The requester has asked the server to switch protocols and the server has agreed to do so. Used for WebSocket upgrades." },
  { code: 102, name: "Processing", description: "The server has received and is processing the request.", detail: "The server has received and is processing the request, but no response is available yet. Used to prevent the client from timing out." },
  { code: 103, name: "Early Hints", description: "Preload resources while the server prepares a response.", detail: "Primarily used with the Link header to allow the user agent to start preloading resources while the server prepares a response." },
  // 2xx
  { code: 200, name: "OK", description: "The request has succeeded.", detail: "Standard response for successful HTTP requests. The actual response will depend on the request method used." },
  { code: 201, name: "Created", description: "The request has been fulfilled and a new resource was created.", detail: "The request has been fulfilled, resulting in the creation of a new resource. Typically used after POST or PUT requests." },
  { code: 202, name: "Accepted", description: "The request has been accepted for processing.", detail: "The request has been accepted for processing, but the processing has not been completed. The request might or might not be eventually acted upon." },
  { code: 204, name: "No Content", description: "The server successfully processed the request but is not returning any content.", detail: "The server successfully processed the request, but is not returning any content. Often used for DELETE operations." },
  { code: 206, name: "Partial Content", description: "The server is delivering only part of the resource.", detail: "The server is delivering only part of the resource due to a range header sent by the client. Used for resumable downloads." },
  // 3xx
  { code: 301, name: "Moved Permanently", description: "The URL has been permanently moved to a new location.", detail: "This and all future requests should be directed to the given URI. Search engines update their links to the resource." },
  { code: 302, name: "Found", description: "The URL has been temporarily moved to a new location.", detail: "Tells the client to look at another URL. Historically used for URL redirection. The request should be repeated with another URI." },
  { code: 303, name: "See Other", description: "The response to the request can be found under another URI.", detail: "The response to the request can be found under another URI using the GET method. Used to redirect after a POST request." },
  { code: 304, name: "Not Modified", description: "The resource has not been modified since the last request.", detail: "Indicates that the resource has not been modified since the version specified by the request headers. The client can use its cached version." },
  { code: 307, name: "Temporary Redirect", description: "The request should be repeated with another URI.", detail: "The request should be repeated with another URI, but future requests should still use the original URI. The method must not change." },
  { code: 308, name: "Permanent Redirect", description: "The request and all future requests should be repeated using another URI.", detail: "The request and all future requests should be repeated using another URI. The method and body must not change." },
  // 4xx
  { code: 400, name: "Bad Request", description: "The server cannot process the request due to a client error.", detail: "The server cannot or will not process the request due to an apparent client error (e.g. malformed request syntax, invalid request message framing)." },
  { code: 401, name: "Unauthorized", description: "Authentication is required and has failed or not been provided.", detail: "Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided." },
  { code: 403, name: "Forbidden", description: "The request was valid, but the server is refusing action.", detail: "The request was valid, but the server is refusing action. The user might not have the necessary permissions for a resource." },
  { code: 404, name: "Not Found", description: "The requested resource could not be found.", detail: "The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible." },
  { code: 405, name: "Method Not Allowed", description: "A request method is not supported for the requested resource.", detail: "A request method is not supported for the requested resource; for example, a GET request on a form that requires data to be presented via POST." },
  { code: 408, name: "Request Timeout", description: "The server timed out waiting for the request.", detail: "The server timed out waiting for the request. According to HTTP specifications, the client may repeat the request without modifications." },
  { code: 409, name: "Conflict", description: "The request could not be processed because of conflict in the current state.", detail: "Indicates that the request could not be processed because of conflict in the current state of the resource." },
  { code: 410, name: "Gone", description: "The resource is no longer available and will not be available again.", detail: "Indicates that the resource requested is no longer available and will not be available again. Similar to 404, but more permanent." },
  { code: 413, name: "Payload Too Large", description: "The request is larger than the server is willing to process.", detail: "The request is larger than the server is willing or able to process." },
  { code: 414, name: "URI Too Long", description: "The URI provided was too long for the server to process.", detail: "The URI provided was too long for the server to process. Often the result of too much data being encoded in the query string." },
  { code: 415, name: "Unsupported Media Type", description: "The media format of the requested data is not supported.", detail: "The media format of the requested data is not supported by the server, so the server is rejecting the request." },
  { code: 422, name: "Unprocessable Entity", description: "The request was well-formed but has semantic errors.", detail: "The request was well-formed but was unable to be followed due to semantic errors. Common in REST APIs when validation fails." },
  { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given amount of time.", detail: "The user has sent too many requests in a given amount of time (rate limiting). The response may include a Retry-After header." },
  // 5xx
  { code: 500, name: "Internal Server Error", description: "The server encountered an unexpected condition.", detail: "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable." },
  { code: 501, name: "Not Implemented", description: "The server does not support the functionality required.", detail: "The server either does not recognize the request method, or it lacks the ability to fulfill the request." },
  { code: 502, name: "Bad Gateway", description: "The server received an invalid response from an upstream server.", detail: "The server was acting as a gateway or proxy and received an invalid response from the upstream server." },
  { code: 503, name: "Service Unavailable", description: "The server is currently unavailable.", detail: "The server is currently unavailable (overloaded or down for maintenance). Generally temporary." },
  { code: 504, name: "Gateway Timeout", description: "The server did not receive a timely response from an upstream server.", detail: "The server was acting as a gateway or proxy and did not receive a timely response from an upstream server." },
  { code: 505, name: "HTTP Version Not Supported", description: "The HTTP version used in the request is not supported.", detail: "The server does not support the HTTP protocol version used in the request." },
];

function groupColor(code: number): string {
  if (code < 200) return "bg-blue-100 text-blue-800";
  if (code < 300) return "bg-emerald-100 text-emerald-800";
  if (code < 400) return "bg-amber-100 text-amber-800";
  if (code < 500) return "bg-red-100 text-red-800";
  return "bg-purple-100 text-purple-800";
}

const GROUPS = [
  { label: "1xx Informational", min: 100, max: 199 },
  { label: "2xx Success", min: 200, max: 299 },
  { label: "3xx Redirection", min: 300, max: 399 },
  { label: "4xx Client Error", min: 400, max: 499 },
  { label: "5xx Server Error", min: 500, max: 599 },
];

export default function HttpStatusCodesApp() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return CODES;
    return CODES.filter(c => c.code.toString().includes(q) || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [search]);

  const isSearching = search.trim() !== "";

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code, name, or description…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
        />
      </section>

      {isSearching ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">No results found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(code => (
                <CodeRow key={code.code} code={code} expanded={expanded} setExpanded={setExpanded} />
              ))}
            </div>
          )}
        </section>
      ) : (
        GROUPS.map(group => {
          const codes = CODES.filter(c => c.code >= group.min && c.code <= group.max);
          if (codes.length === 0) return null;
          return (
            <section key={group.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-base font-semibold text-slate-950">{group.label}</h3>
              <div className="divide-y divide-slate-100">
                {codes.map(code => (
                  <CodeRow key={code.code} code={code} expanded={expanded} setExpanded={setExpanded} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function CodeRow({ code, expanded, setExpanded }: { code: StatusCode; expanded: number | null; setExpanded: (n: number | null) => void }) {
  const isOpen = expanded === code.code;
  return (
    <div>
      <button
        className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50 transition rounded-lg px-2 -mx-2"
        onClick={() => setExpanded(isOpen ? null : code.code)}
      >
        <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums ${groupColor(code.code)}`}>
          {code.code}
        </span>
        <span className="flex-1">
          <span className="text-sm font-semibold text-slate-800">{code.name}</span>
          <span className="ml-2 text-sm text-slate-500">{code.description}</span>
        </span>
        <span className="shrink-0 text-slate-400">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="mb-2 ml-12 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          {code.detail}
        </div>
      )}
    </div>
  );
}
