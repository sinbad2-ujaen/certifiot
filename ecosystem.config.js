module.exports = {
    apps: [{
        name: "manager",
        script: "./manager/index.js",
        watch: true
    },
        {
            name: "verifier",
            script: "./verifier/index.js",
            watch: true
        },
        {
            name: "storage",
            script: "./storage/index.js",
            ignore_watch: ["phonendo_db"],
            watch: true
        },
        {
            name: "reader",
            script: "./reader/index.js",
            watch: true
        },
        {
            name: "publisher",
            script: "./publisher/index.js",
            watch: true
        },
        {
            name: "identity",
            script: "./identity/index.js",
            watch: true
        }
    ]
}
