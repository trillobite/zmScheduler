# zmScheduler
Allows zoneminder cameras to be toggled depending on date and time.

#### Dev Notes
- No release made yet, some cameras still don't change their modes.
- Code is ALPHA not ready for production.

#### Requirements
To run, create the config.js next to index.js, it's format is as follows:

``` javascript
let login = {
    username: "user",
    password: "pass"
};

let state = (mode) => {
    let modes = ["dev", "stage", "prod"];
    return modes[mode];
};

let cameras = {
    list: [
        "downstairs bar",
        "back bar",
        "back bar stage",
        "North 1",
        "North 2",
        "balcony",
        "main bar",
    ],

    default: {
        mode: "Modect"
    },

    //our nightclub hours.
    times: [
        {
            start: {
                mode: "Mocord",
                day: 5, //Friday
                time: 23 //11PM
            },
            end: {
                mode: "Modect",
                day: 6, //Saturday
                time: 2 //2 AM
            }
        },
        {
            start: {
                mode: "Mocord",
                day: 6, //Saturday
                time: 23 //11PM
            },
            end: {
                mode: "Modect",
                day: 0, //Sunday
                time: 2 //2 AM
            }
        }
    ]
}

module.exports = {
    state: state(0), //0 is dev.
    login: login,
    url: "http://192.168.100.57/zm/api",
    cameras: cameras,
}
```
