const bandLogo = "assets/logos/Deep Purple.png";

const bandEvents = [
    {
        date: "1965-08-15",
        lat: 40.7128,
        lon: -74.0060,
        type: "tour",
        description: "First US tour - NYC",
        
        members: [
        { photo: "assets/members/David.jpeg" },
        { photo: "assets/members/Ian.jpeg" },
        { photo: "assets/members/Jon.jpeg" },
        { photo: "assets/members/Paice.jpeg" },
        { photo: "assets/members/Ritchie.jpeg" },
        { photo: "assets/members/Roger.jpeg" }
        ]
    },
    {
        date: "1971-11-05",
        lat: 51.5074,
        lon: -0.1278,
        type: "album",
        description: "Album released in London"
    },
    {
        date: "1983-01-01",
        lat: 51.5074,
        lon: -0.1278,
        type: "breakup",
        description: "Temporary band hiatus"
    }
];

// extract member names from the image names
bandEvents.forEach(event => {
    event.members?.forEach(m => {
        m.name = m.photo.split("/").pop().split(".")[0];
    });
});