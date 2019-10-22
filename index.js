//cookies are enabled in request.
const cron = require("node-cron");
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

    if (config.state == "dev" || config.state == "stage") {
        console.log("getting camera list...");
    }

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

            if (config.state == "dev" || config.state == "stage") {
                console.log("Command:", `Monitor[Function]=${mode}&Monitor[Enabled]=1`);
            }

            request.post({
                url: `${zmRoot}/monitors/${camera}.json`,
                headers: { //might not be required, supposed to be set automatically.
                    "content-type": "x-www-form-urlencoded",
                },
                form: {
                    Monitor: {
                        Function: mode,
                    }
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

            if (config.state == "dev" || config.state == "stage") {
                console.log("getting camera status...");
            }

            cameraList().done((list) => {
                //console.log(list.monitors[0]);
                list.monitors.map((cam, index) => {
                    //console.log("cam:", cam);
                    if (cam.Monitor.Name == name) {

                        if (config.state == "dev" || config.state == "stage") {
                            console.log("cam: ", cam.Monitor.Name);
                        }

                        cam.Monitor.index = index + 1;
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

    let chk = (day) => {
        return day == now.getDay() ? true : false;
    };

    for (let i = 0; i < times.length; ++i) {
        let time = times[i];

        let todayStart = chk(time.start.day);
        let todayEnd = chk(time.end.day);

        if (config.state == "dev" || config.state == "stage") {
            console.log("Is start and end same day?", todayStart && todayEnd ? true : false);
        }

        if (todayStart && !todayEnd) {

            if (config.state == "dev" || config.state == "stage") {
                console.log("SCHEDULE START");
                console.log("start time:", now.getHours(), time.start.time, time.start.time <= now.getHours());
            }

            if (now.getHours() >= time.start.time) {

                if (config.state == "dev" || config.state == "stage") {
                    console.log("time:", time.start);
                }

                return time.start;
            }
        } else if (todayEnd) {

            if (config.state == "dev" || config.state == "stage") {
                console.log("SCHEDULE END");
                console.log("end time:", time.end.time, now.getHours(), time.end.time >= now.getHours());
            }

            if (time.end.time >= now.getHours()) {

                if (config.state == "dev" || config.state == "stage") {
                    console.log("time:", time.end);
                }

                return time.end;
            }
        }
    }
    return false; //did not match anything...
};

let set = (setMode, camList) => {
    return new Promise((resolve, reject) => {

        let indx = 0;

        let recFunc = (cam) => {
            console.log("Checking:", cam);
            try {
                getCamStatus(cam).done((currStatus) => {
                    let camMode = currStatus.Function;
                    let index = currStatus.index;

                    if (config.state == "dev" || config.state == "stage") {
                        console.log("modes:", camMode, "vs", setMode);
                    }

                    if (camMode != setMode) {

                        if (config.state == "dev") {
                            console.log("Changing Status to...", setMode);
                        }

                        setCamera(setMode, index).done((result) => {
                            if (config.state == "dev" || config.state == "stage") {
                                console.log("Set camera result:", result);
                            }

                            if (result != { message: "Saved" }) {
                                console.log("Unexpected Result:", result);
                            }

                            setTimeout(() => {
                                rec(); //call rec to get the next object.
                            }, 5000); //wait for 5 seconds, so zoneminder will have time to respond.
                        });
                    } else {
                        if (config.state == "dev" || config.state == "stage") {
                            console.log("Recording option already set for:", cam);
                        }

                        rec();
                    }
                });
            } catch (e) {
                console.log("error:", e);
                reject("failed to set defaults on cameras:", e);
            }
        }

        //were calling this to make a recursive loop...
        let rec = () => {
            if (indx + 1 > camList.length) {
                resolve(indx);
                return;
            } else {
                let obj = camList[indx];
                ++indx;
                recFunc(obj);
            }
        };

        //lets start the loop.
        rec();
    });

};

let setDefaults = () => {
    return new Promise((resolve, reject) => {
        login().done((cookies) => {

            if (config.state == "dev" || config.state == "stage") {
                console.log("here's your cookies!", cookies);
            }

            console.log("First startup... checking camera defaults...");

            //if we are in a valid time range... don't set defaults
            let def = timeVerify(config.cameras.times);
            if (def) {
                if (config.state == "dev" || config.state == "stage") {
                    console.log(def);
                    console.log("skipping defaults...");
                }
                resolve(def); //we don't need to do anything here.
            } else {
                set(config.cameras.default.mode, config.cameras.list).done((returned) => {
                    resolve(returned);
                });
            }
        });
    });
};

let setMode = () => {

    login().done((cookies) => {
        if (config.state == "dev" || config.state == "stage") {
            console.log("here's your cookies!", cookies);
        }

        let def = timeVerify(config.cameras.times);
        if (def) {
            set(def.mode, config.cameras.list).done((result) => {
                if (config.state == "dev") {
                    console.log("result:", result);
                }
            });
        } else {
            console.log("Nothing to do yet, will try again later.", Date());
        }

    });

};

console.log("running in:", config.state, "mode");

//comment out for prod.
if (config.state == "dev") {
    setDefaults().done((def) => {

        if (config.state == "prod" || config.state == "stage") {
            console.log("starting up with state:", def);
        }

        setMode();
    });
}

if (config.state == "prod" || config.state == "stage") {
    //defaults are set on first run.
    setDefaults().done((def) => {

        if (config.state == "prod" || config.state == "stage") {
            console.log("starting up with state:", def);
        }

        //currently running every minute for testing purposes.
        //run every hour Fri, Sat, & Sun for nightclub.
        cron.schedule("* */1 * * 5-7", () => {
            console.log("zmScheduler is running...");
            setMode();
        });
    });
}
