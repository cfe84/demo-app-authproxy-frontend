const express = require("express");
const getTokenAndUpdateExpirationAsync = require("./getTokenAndUpdateExpirationAsync");

const PORT = process.env.PORT || 8080;
const URL = process.env.URL || "http://not defined.com";

const app = new express();

app.use(express.static("./static"));

app.get("/api/connectionInfo", (req, res) => {
    const username = req.headers["x-ms-client-principal-name"] || "thisisatest@microsoft.com";
    getTokenAndUpdateExpirationAsync(username)
        .then((token) => {
            res.json({
                username: username,
                url: URL,
                apiKey: token
            });
            res.end();
        })
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));