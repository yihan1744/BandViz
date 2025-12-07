const bandLogo = "assets/logos/Deep Purple.png";

const bandEvents = [
    {
        type: "tour",
        date: "1965-08-15",
        precision: "day",
        
        title: "First US tour - NYC",
        description: "nope",

        location:{
            type: "city",
            name: "New York City",
            lat: 40.7128,
            lon: -74.0060,
        }
    },
    {
        type: "album",
        date: "1971-11-05",
        precision: "day",
        title: "deep purple",
        description: "1st Album released",

        location:{
            type: "birthplace",
            name: "London",
            lat: 51.5074,
            lon: -0.1278,
        }
        
    },
    {
        type: "breakup",
        date: "1983-01-01",
        precision: "day",
        title: "Temporary band hiatus",

        location:{
            type: "birthplace",
            name: "London",
            lat: 51.5074,
            lon: -0.1278,
        }
    }
];

// // extract member names from the image names
// bandEvents.forEach(event => {
//     event.members?.forEach(m => {
//         m.name = m.photo.split("/").pop().split(".")[0];
//     });
// });


// members: [
//         // { photo: "assets/members/David.jpeg" },
//         // { photo: "assets/members/Ian.jpeg" },
//         // { photo: "assets/members/Jon.jpeg" },
//         // { photo: "assets/members/Paice.jpeg" },
//         // { photo: "assets/members/Ritchie.jpeg" },
//         // { photo: "assets/members/Roger.jpeg" }

//         { name: "David" },
//         { name: "Ian" },
//         { name: "Jon" },
//         { name: "Paice" },
//         { name: "Ritchie" },
//         { name: "Roger" }
//         ]