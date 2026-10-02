// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// ---------------------------------------------------------------------------
// CSRF
//
// The server puts `doubleCsrfProtection` in front of every route (express.setup.ts) and
// issues the `XSRF-TOKEN` cookie on GET requests only. Any PUT/POST/PATCH/DELETE without
// the matching cookie *and* `x-xsrf-token` header is rejected with 403 before it reaches
// a controller — which is what the browser does for the app itself, and what `cy.request`
// does not do on its own.
//
// Rather than change every spec, `request` is overwritten to do what the browser does:
// one GET to obtain the token, then echo it back on every mutating call. Cypress keeps
// the cookie in its jar and sends it automatically, so only the header has to be added.
//
// Pass `csrf: false` in the request options to skip this — for a test that wants to assert
// the 403 itself.
// ---------------------------------------------------------------------------

const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "x-xsrf-token";
// Any GET issues the cookie; /v2/info is public and cheap.
const CSRF_BOOTSTRAP_URL = "/v2/info";

// Held per spec. The token is fetched in the hook below rather than inside the overwritten
// command, because a Cypress command may not run other cy commands from inside a returned
// promise ("Cypress detected that you returned a promise from a command while also
// invoking one or more cy commands in that promise"). So: async work in the hook,
// synchronous header injection in the command.
let csrfToken = null;

beforeEach(() => {
    csrfToken = null;
    // Needs a reachable API — every spec in this suite runs against the stack anyway
    // (e2e/README.md), and CI starts Cypress only once the stack reports healthy.
    cy.request({ method: "GET", url: CSRF_BOOTSTRAP_URL, csrf: false })
        .then(() => cy.getCookie(CSRF_COOKIE))
        .then(cookie => {
            if (cookie) {
                // The cookie carries `token|hash` URL-encoded (the separator arrives as
                // `%7C`). The server splits the header on a literal '|', so the decoded
                // value has to be sent or the split yields the whole string and every
                // mutating request comes back 403.
                csrfToken = decodeURIComponent(cookie.value);
            }
        });
});

// cy.request accepts (options), (url), (url, body), (method, url) and (method, url, body).
function toOptions(args) {
    if (args.length === 1 && typeof args[0] === "object") {
        return { ...args[0] };
    }
    if (args.length === 1) {
        return { url: args[0] };
    }
    const looksLikeMethod = /^(get|post|put|patch|delete|head|options)$/i.test(args[0]);
    return looksLikeMethod
        ? { method: args[0], url: args[1], body: args[2] }
        : { url: args[0], body: args[1] };
}

Cypress.Commands.overwrite("request", (originalFn, ...args) => {
    const options = toOptions(args);
    const method = String(options.method || "GET").toUpperCase();
    const skip = options.csrf === false;
    delete options.csrf;

    const needsToken = !skip && method !== "GET" && method !== "HEAD";
    if (!needsToken || !csrfToken) {
        return originalFn(options);
    }

    return originalFn({
        ...options,
        headers: { ...options.headers, [CSRF_HEADER]: csrfToken }
    });
});

Cypress.Commands.add("login", user => {
    return cy
        .request({
            method: "POST",
            url: "/v2/users/login",
            body: {
                email: user.email,
                password: user.password
            }
        })
        .then(response => {
            window.localStorage.setItem(
                "currentUser",
                JSON.stringify(response.body)
            );
        });
});

// Not working in Headless mode
Cypress.Commands.add("loadSamplesFile", fileName => {
    cy.server();
    cy.route("PUT", "/v2/samples").as("samples");
    cy.route("PUT", "/v2/samples/validated").as("validated");
    cy.visit("/upload");
    const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const fileInput = "input[type=file]";
    return cy.fixture(fileName, "base64").then(fileContent => {
        // @ts-ignore
        const res = cy
            .get(fileInput)
            .first()
            .upload(
                {
                    fileContent,
                    fileName,
                    mimeType: fileType,
                    encoding: "base64"
                },
                {
                    force: true
                }
            );

        cy.wait("@samples");
        cy.wait("@validated");
        return res;
    });
});

// Cypress.Commands.add("loadSamples", () => {
//     const response = {
//         order: {
//             meta: {
//                 nrl: "NRL-AR",
//                 analysis: {
//                     species: false,
//                     serological: false,
//                     phageTyping: false,
//                     resistance: false,
//                     vaccination: false,
//                     molecularTyping: false,
//                     toxin: false,
//                     zoonosenIsolate: false,
//                     esblAmpCCarbapenemasen: false,
//                     other: "",
//                     compareHuman: false
//                 },
//                 sender: {
//                     instituteName: "",
//                     department: "",
//                     street: "",
//                     zip: "",
//                     city: "",
//                     contactPerson: "",
//                     telephone: "",
//                     email: ""
//                 },
//                 urgency: "NORMAL",
//                 fileName: "einsendebogen.xlsx"
//             },
//             samples: [
//                 {
//                     sample: {
//                         sample_id: { value: "1" },
//                         sample_id_avv: { value: "1-ABC" },
//                         pathogen_avv: { value: "Escherichia coli" },
//                         pathogen_text: { value: "" },
//                         sampling_date: { value: "14.09.2017" },
//                         isolation_date: { value: "15.09.2017" },
//                         sampling_location_avv: { value: "11000000" },
//                         sampling_location_zip: { value: "10178" },
//                         sampling_location_text: { value: "Berlin" },
//                         animal_avv: { value: "01" },
//                         matrix_avv: { value: "063502" },
//                         animal_matrix_text: {
//                             value: "Hähnchen auch tiefgefroren"
//                         },
//                         primary_production_avv: { value: "999" },
//                         sampling_reason_avv: { value: "10" },
//                         program_reason_text: { value: "Planprobe" },
//                         operations_mode_avv: { value: "4010000" },
//                         operations_mode_text: {
//                             value: "Lebensmitteleinzelhandel"
//                         },
//                         vvvo: { value: "" },
//                         comment: { value: "" }
//                     }
//                 }
//             ]
//         }
//     };
//     cy.server({
//         method: "PUT",
//         url: "/v1/samples"
//     });
//     cy.route({ method: "PUT", url: "/v1/samples", response, status: 200 }).as(
//         "samples"
//     );
//     cy.route("PUT", "/v1/samples/validated").as("validated");
//     return cy
//         .request({
//             method: "PUT",
//             url: "/v1/samples",
//             failOnStatusCode: false,
//             body: response
//         })
//         .then(response => {
//             console.log(response);
//         });
// });
