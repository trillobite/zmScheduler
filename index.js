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
    console.log("getting camera list...");
    return new Promise((resolve, reject) => {
        try {
            request.get({
                url: `${zmRoot}/monitors.json`
            }, (err, httpResponse, body) => {
                if (err) {
                    console.log("Cannot get camera list:", err);
                    reject(err);
                } else {
                    resolve(JSON.parse(body));
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
    console.log("setting camera...", camera, "to...", mode);
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
                    resolve(JSON.parse(body));
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
            console.log("getting camera status...");
            cameraList().done((list) => {
                //console.log(list.monitors[0]);
                list.monitors.map((cam, index) => {
                    //console.log("cam:", cam);
                    if (cam.Monitor.Name == name) {
                        console.log("cam: ", cam.Monitor.Name);
                        cam.Monitor.index = index;
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

    for (let i = 0; i < times.length; ++i) {
        let time = times[i];

        console.log("day:", time.start.day, now.getDay());
        if (time.start.day == now.getDay()) {
            console.log("start time:", now.getHours(), time.start.time, time.start.time <= now.getHours());
            if (now.getHours() >= time.start.time) {
                console.log("time:", time.start);
                return time.start;
            }
        } else if (time.end.day == now.getDay()) {
            console.log("end time:", time.end.time, now.getHours(), time.end.time >= now.getHours());
            if (time.end.time >= now.getHours()) {
                console.log("time:", time.end);
                return time.end;
            }
        }
        return false; //did not match anything...
    }
};

let setMode = () => {

    login().done((cookies) => {
        console.log("here's your cookies!", cookies);

        let indx = 0;

        let recFunc = (cam) => {
            console.log(cam);
            try {
                //time mode which matched from config.
                let def = timeVerify(config.cameras.times);
                if (def) { //anything but false.
                    console.log("match!", cam, def);
                    //console.log(await getCamStatus(cam));
                    getCamStatus(cam).done((currStatus) => {
                        let camMode = currStatus.Function;
                        let index = currStatus.index;

                        console.log("modes:", camMode, "vs", def.mode);
                        if (camMode != def.mode) {
                            console.log("Changing Status to...", def.mode);
                            setCamera(def.mode, index).done((result) => {
                                console.log("Set camera result:", result);
                                rec(); //call rec to get the next object.
                            });
                        } else {
                            console.log("Recording option already set.");
                            rec();
                        }
                    });
                }

            } catch (e) {
                console.log("error:", e);
            }
        }

        //were calling this to make a recursive loop...
        let rec = () => {
            if (indx + 1 > config.cameras.list.length) {
                return;
            } else {
                let obj = config.cameras.list[indx];
                ++indx;
                recFunc(obj);
            }
        };

        //lets start the loop.
        rec();

    });

};

setMode();

