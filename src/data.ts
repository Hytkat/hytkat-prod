// Unreleased snippets: put audio in /public/audio and set src ("/audio/idea1.mp3"). Empty src plays a demo tone.
export const SNIPS = [
  { title: "KALYANI", src: "audio/Project_44.mp3", cover: "elements/KALYANIpng.png" },
  { title: "Dandelions", src: "audio/Project_38.mp3" },
  { title: "Temple Bells", src: "" },
];

// Previous work. img is optional (e.g. "/work/apl.jpg" in /public/work).
export const WORK = [
  { name: "Assam Premier League", tag: "APL", blurb: "Music and production for Tezpur Titans.", img: "elements/TT.png" },
  { name: "Short Films", tag: "FILMS", blurb: "Score and sound design for short films.", img: "" },
];

// Songs from other artists' Spotify links to show in the strip.
export const EXTRA_LINKS = [
  "https://open.spotify.com/album/5e3QS5FMaoIvoQM0U7nex8?si=Ri-8tVtpTXmbuHNWulNzgQ",
  "https://open.spotify.com/track/5NVBnZQa2RrNGd8CB4kQvj?si=39a48911609c4d00",
  "https://open.spotify.com/track/6gJWk5mB1kUF2g25O8osNV?si=11e590f96a5a4d73",
  "https://open.spotify.com/track/0KhIhONFiOKPrCShF0Cpwf?si=09ae7964a5bb4ee5",

];

// Release titles to hide.
export const HIDE: string[] = ["Rose", "Kaxote"];

//Videos
export const VIDEO_LINKS: string[] = [
  "https://youtu.be/3jtlK6Njj5k",
  "https://youtu.be/enyy7k1TEoQ",
];
export const NOTES: Record<string, string> = {
  "still waiting": "Write a line or two about this song here.",
  "kalyani": "Another description here.",
};
