const request = require("request");
// const Cookie = require("request-cookies").Cookie;
// const cookieJar = require("request-cookies").CookieJar;
const zmRoot = "http://192.168.100.57/zm/api";


let now = new Date();

// console.log(now.getDate());
// console.log(now.getDay());
// console.log(now.getHours());

let setMode = async (mode, camera) => {
    try {
        await request.post({
            url: `${zmRoot}/host/login.json`, form: {
                user: "admin",
                pass: "BnCQd9*B7i"
            }
        }, async (err, httpResponse, body) => {
            // let rawcookies = httpResponse.headers["set-cookie"];
            // rawcookies.map((raw) => {
            //     let cookie = new Cookie(raw);
            //     cookieJar.apply(cookie);
            // })

            console.log("COOKIES:", httpResponse.headers["set-cookie"]);

            await request.post({
                url: `${zmRoot}/monitors/${camera}.json`, form: {
                    "Monitor[Function]": `${mode}`
                }
            }, (err, httpResponse, body) => {
                console.log("cameraResponse:", body);
            });

        });



    } catch (e) {
        console.log("Error:", e);
        return false;
    }

    return true;
};

setMode("Mocord", 1);

