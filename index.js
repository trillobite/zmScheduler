const request = require("request").defaults({ jar: true });
const Promise = require("promise");
const zmRoot = "http://192.168.100.57/zm/api";

let now = new Date();

// console.log(now.getDate());
// console.log(now.getDay());
// console.log(now.getHours());

let setMode = async (setArr) => {

    let login = () => {
        return new Promise((resolve, reject) => {
            try {
                request.post({
                    url: `${zmRoot}/host/login.json`, form: {
                        user: "apiUser",
                        pass: "toggL3thew0rld!."
                    }
                }, (err, httpResponse, body) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(httpResponse.headers["set-cookie"]);
                    }
                });
            } catch (e) {
                console.log("error:", e);
                reject(e);
            }
        });
    };

    //gets a list of cameras currently setup in zoneminder.
    let cameraList = () => {
        return new Promise((resolve, reject) => {
            try {
                request.get({
                    url: `${zmRoot}/monitors.json`
                }, (err, httpResponse, body) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(body);
                    }
                });
            } catch (e) {
                console.log("error:", e);
                reject(e);
            }
        });
    };

    //sets the recording mode of a camera.
    let setCamera = (mode, camera) => {
        return new Promise((resolve, reject) => {
            try {
                request.post({
                    url: `${zmRoot}/monitors/${camera}.json`, form: {
                        "Monitor[Function]": `${mode}`
                    }
                }, (err, httpResponse, body) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(body);
                    }
                });
            } catch (e) {
                console.log("error:", e);
                reject(e);
            }
        });
    };

    let cookies = await login(); //first we need to get the cookies, and store them into request jar.
    let camArr = await cameraList();
    console.log(camArr);
    // setArr.map((cam) => {
    //     try {
    //         await setCamera(cam.mode, cam.camera);
    //     } catch (e) {
    //         console.log("error:", e);
    //     }
    // });
};

setMode([]);

