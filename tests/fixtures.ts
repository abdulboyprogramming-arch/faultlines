/** Shared test fixtures: deliberately messy, real-classroom-flavoured data. */

export const FRENCH_ANSWERS = [
  "Parce que la Terre se rapproche du Soleil en été",
  "La Terre est plus proche du soleil pendant l'été",
  "L'inclinaison de la Terre change l'angle des rayons du soleil",
  "Je ne sais pas",
  "Parce que la terre tourne autour du soleil avec un axe incliné",
];

export const UNICODE_ANSWERS = [
  "Earth 🌍 moves closer to the sun ☀️ in summer!!!",
  "Ｅａｒｔｈ is nearer... the SUN?? (obviously)",
  "Naïve answer — “closer to the sun”, 100%",
  "Emoji only 🤷",
];

export const DUPLICATES = [
  "The earth is closer to the sun in summer",
  "The earth is closer to the sun in summer",
  "THE EARTH IS CLOSER TO THE SUN IN SUMMER",
  "The tilt of the earth changes sunlight angle",
];

export const ALL_VAGUE = ["idk", "?", "not sure", "dunno", "pass", "—", "I dont know", "no idea"];

export const ONE_WORD_VS_LONG = [
  "Tilt.",
  "The Earth's axis is tilted at about 23.5 degrees relative to its orbital plane, so as it orbits the Sun over a year each hemisphere alternately leans toward and away from the Sun, changing both the angle at which sunlight strikes the surface and the length of the day, which together produce the seasons we experience.",
  "axis tilt",
];

const DISTANCE_PHRASES = [
  "The earth is closer to the sun in the summer months",
  "Because we move nearer to the sun in June it gets warmer",
  "Summer is when earth is closest to the sun in its orbit",
  "The sun is nearer to us so its heat is stronger in summer",
];
const TILT_PHRASES = [
  "The tilt of the earth changes the sunlight angle through the year",
  "Earth's axis tilts so each hemisphere leans toward the sun in turn",
  "Axial tilt makes sunlight hit at a steeper angle in summer",
  "Because the axis is tilted the northern hemisphere gets direct sunlight",
];
export const BIG_CLASS = Array.from({ length: 120 }, (_, i) =>
  i % 3 === 0 ? DISTANCE_PHRASES[i % DISTANCE_PHRASES.length]
  : i % 3 === 1 ? TILT_PHRASES[i % TILT_PHRASES.length]
  : "Not sure really",
);

export const CSV_QUOTED = `name,answer,score
A,"Earth is closer, obviously",3
B,"It tilts
on its axis",4
C,"He said ""closer"" loudly",2`;

export const CSV_NO_HEADER = `Earth is closer to the sun,A
The tilt changes the angle,B`;
