# zmScheduler
Allows zoneminder cameras to be toggled depending on date and time.

### Requirements
To run, config.js will be required, it's format is as follows:

``` javascript
let login = {
    username: "user",
    password: "pass",
};

let cameras = {
    list: [
        "downstairs bar",
        "downstairs dining",
        "back bar",
        "back bar stage",
        "North 1",
        "North 2",
        "balcony",
        "main bar",
    ],
    //our nightclub hours.
    times: [
        { //test day
            start: {
                mode: "Mocord",
                day: 4, //thursday
                time: 14 //2PM
            },
            end: {
                mode: "Modect",
                day: 4, //friday
                time: 2 //2 AM
            }
        },
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
                day: 0, //Sunday
                time: 23 //11PM
            },
            end: {
                mode: "Modect",
                day: 1, //Monday
                time: 2 //2 AM
            }
        }
    ]
}

module.exports = {
    login: login,
    url: "http://192.168.100.57/zm/api",
    cameras: cameras,
}
```
