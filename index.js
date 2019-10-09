//cookies are enabled in request.
const config = require("./config");
const request = require("request").defaults({ jar: true });
const Promise = require("promise");
const zmRoot = config.url;


let login = () => {
    return new Promise((resolve, reject) => {
        try {
            request.post({
                url: `${zmRoot}/host/login.json`, form: {
                    user: config.login.username,
                    pass: config.login.password
                }
            }, (err, httpResponse, body) => {
                if (err) {
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
                if (err) {
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
                if (err) {
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

let getCamStatus = (name) => {
    return new Promise((resolve, reject) => {
        try {
            cameraList().done((list) => {
                list.map((cam) => {
                    if (cam.Monitor.Name == name) {
                        resolve(cam.Monitor);
                    }
                });
            });
        } catch (e) {
            console.log("error:", e);
            reject(e);
        }
    });
};

let timeVerify = (times) => {

    let now = new Date();

    // console.log(now.getDate());
    // console.log(now.getDay());
    // console.log(now.getHours());
    times.map((time) => {
        if (time.start.day == now.getDay()) {
            if (time.start.time >= now.getHours()) {
                return time.start;
            }
        } else if(time.end.day == now.getDay()) {
            if(time.end.time >= now.getHours()) {
                return time.end;
            }
        }
        return false; //did not match anything...
    })
};

let setMode = async () => {

    let cookies = await login(); //first we need to get the cookies, and store them into request jar.
    console.log(cookies);
    let camArr = await cameraList();
    console.log(camArr);

    config.cameras.list.map((cam) => {
        try {
            //time mode which matched from config.
            let def = timeVerify(config.cameras.times);
            if(def) { //anything but false.
                let camMode = getCamStatus(cam).Function;
                if(camMode != def.mode) {
                    setCamera(def.mode); //set the camera to the correct mode.
                }
            }

        } catch (e) {
            console.log("error:", e);
        }
    });
};

setMode();

