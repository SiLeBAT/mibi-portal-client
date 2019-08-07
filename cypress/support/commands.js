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
import "cypress-file-upload";

Cypress.Commands.add("login", user => {
    return cy
        .request({
            method: "POST",
            url: "/v1/users/login",
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
    cy.route("PUT", "/v1/samples").as("samples");
    cy.route("PUT", "/v1/samples/validated").as("validated");
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
//                         pathogen_adv: { value: "Escherichia coli" },
//                         pathogen_text: { value: "" },
//                         sampling_date: { value: "14.09.2017" },
//                         isolation_date: { value: "15.09.2017" },
//                         sampling_location_adv: { value: "11000000" },
//                         sampling_location_zip: { value: "10178" },
//                         sampling_location_text: { value: "Berlin" },
//                         topic_adv: { value: "01" },
//                         matrix_adv: { value: "063502" },
//                         matrix_text: {
//                             value: "Hähnchen auch tiefgefroren"
//                         },
//                         process_state_adv: { value: "999" },
//                         sampling_reason_adv: { value: "10" },
//                         sampling_reason_text: { value: "Planprobe" },
//                         operations_mode_adv: { value: "4010000" },
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
