const request = require("request");
const zmRoot = "http://192.168.100.57/zm/api";


let now = new Date();

console.log(now.getDate());
console.log(now.getDay());
console.log(now.getHours());

let setMode = async (mode, camera) => {
    try {
        await request.post({url:`${zmRoot}/host/login.json`, form: {
            user: "admin",
            pass: "BnCQd9*B7i"
        }}, (err,httpResponse,body) => {
            console.log("loginResponse:", httpResponse.headers["set-cookie"]);
        });


        // await request.post({url:`${zmRoot}/monitors/${camera}.json`, form: {
        //     "Monitor[Function]": `${mode}`
        // }}, (err,httpResponse,body) => {
        //     console.log("cameraResponse:", body);
        // });

    } catch (e) {
        console.log("Error:", e);
        return false;
    }

    return true;
};

setMode("Mocord", 1);

