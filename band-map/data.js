const bandLogo = "assets/logos/Deep Purple.png";

const bandEvents = [
    {
        type: "formation",
        date: "1968-01-01",
        precision: "year",
        title: "Band Formation",
        description: "Deep Purple was formed in Hertford, England.",
        location: {
            type: "birthplace",
            name: "Hertford, England",
            lat: 51.7965,
            lon: -0.0773
        },
        members: ["Ritchie Blackmore", "Jon Lord", "Ian Paice", "Nick Simper", "Rod Evans"]
    },
    {
        type: "album",
        date: "1968-07-22",
        precision: "day",
        title: "Shades of Deep Purple",
        description: "Debut album released.",
        location: {
            type: "city",
            name: "London",
            lat: 51.5074,
            lon: -0.1278
        },
        album: {
            title: "Shades of Deep Purple",
            cover: "assets/albums/ShadesOfDeepPurple.jpg",
            musicbrainz_id: "album-001"
        }
    },
    {
        type: "tour",
        date: "1969-02-01",
        precision: "month",
        title: "European Tour",
        description: "Tour across major European cities.",
        location: {
            type: "city",
            name: "Paris, France",
            lat: 48.8566,
            lon: 2.3522
        }
    },
    {
        type: "member_leave",
        date: "1969-06-15",
        precision: "day",
        title: "Rod Evans leaves",
        location: {
            type: "city",
            name: "London",
            lat: 51.5074,
            lon: -0.1278
        },
        members: ["Rod Evans"]
    },
    {
        type: "member_join",
        date: "1969-06-20",
        precision: "day",
        title: "Ian Gillan joins",
        location: {
            type: "city",
            name: "London",
            lat: 51.5074,
            lon: -0.1278
        },
        members: ["Ian Gillan"]
    },
    {
        type: "album",
        date: "1970-03-05",
        precision: "day",
        title: "Deep Purple in Rock",
        description: "Second album released, classic lineup.",
        location: {
            type: "city",
            name: "London",
            lat: 51.5074,
            lon: -0.1278
        },
        album: {
            title: "Deep Purple in Rock",
            cover: "assets/albums/DeepPurpleInRock.jpg",
            musicbrainz_id: "album-002"
        }
    },
    {
        type: "breakup",
        date: "1976-12-01",
        precision: "month",
        title: "Temporary Hiatus",
        description: "Band splits temporarily after lineup changes.",
        location: {
            type: "country",
            name: "UK",
            lat: 55.3781,
            lon: -3.4360
        }
    },
    {
        type: "reunion",
        date: "1984-01-01",
        precision: "year",
        title: "Reunion Tour",
        description: "Classic lineup reunion tour starts.",
        location: {
            type: "virtual",
            name: "Band Origin",
            lat: 51.7965,
            lon: -0.0773
        }
    }
];


// // Old pseudo data
// const bandEvents = [
//     {
//         type: "tour",
//         date: "1965-08-15",
//         precision: "day",
        
//         title: "First US tour - NYC",
//         description: "nope",

//         location:{
//             type: "city",
//             name: "New York City",
//             lat: 40.7128,
//             lon: -74.0060,
//         }
//     },
//     {
//         type: "album",
//         date: "1971-11-05",
//         precision: "day",
//         title: "deep purple",
//         description: "1st Album released",

//         location:{
//             type: "birthplace",
//             name: "London",
//             lat: 51.5074,
//             lon: -0.1278,
//         }
        
//     },
//     {
//         type: "breakup",
//         date: "1983-01-01",
//         precision: "day",
//         title: "Temporary band hiatus",

//         location:{
//             type: "birthplace",
//             name: "London",
//             lat: 51.5074,
//             lon: -0.1278,
//         }
//     }
// ];

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