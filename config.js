let login = {
    username: "apiUser",
    password: "toggL3thew0rld!.",
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
                day: 2, //tuesday
                time: 18 //6PM
            },
            end: {
                mode: "Modect",
                day: 3, //wednesday.
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