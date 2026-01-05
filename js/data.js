/**
 * 🌍 Planet Data
 * All scientific data and fun facts about our solar system
 */

export const PLANET_DATA = {
    sun: {
        name: 'Sun',
        icon: '☀️',
        type: 'G-type Main-sequence Star',
        color: 0xffdd00,
        size: 5,
        distance: 0,
        orbitSpeed: 0,
        tilt: 7.25,
        distanceFromSun: 'Center of Solar System',
        orbitalPeriod: 'N/A',
        diameter: '1,392,700 km',
        moonCount: '0',
        description: 'The Sun is the star at the center of our Solar System. It is a nearly perfect ball of hot plasma, heated to incandescence by nuclear fusion reactions in its core.',
        funFact: 'The Sun accounts for about 99.86% of the total mass of the Solar System!',
        hasAtmosphere: false,
        moons: []
    },
    
    mercury: {
        name: 'Mercury',
        icon: '🪨',
        type: 'Terrestrial Planet',
        color: 0x8c7853,
        size: 0.4,
        distance: 10,
        orbitSpeed: 4.74,
        tilt: 0.034,
        distanceFromSun: '57.9 million km',
        orbitalPeriod: '88 Earth days',
        diameter: '4,879 km',
        moonCount: '0',
        description: 'Mercury is the smallest planet in our solar system and the closest to the Sun. Its surface is heavily cratered and resembles the Moon.',
        funFact: 'A day on Mercury (sunrise to sunrise) lasts 176 Earth days!',
        hasAtmosphere: false,
        moons: []
    },
    
    venus: {
        name: 'Venus',
        icon: '🌕',
        type: 'Terrestrial Planet',
        color: 0xe6c87a,
        size: 0.9,
        distance: 14,
        orbitSpeed: 3.50,
        tilt: 177.4,
        distanceFromSun: '108.2 million km',
        orbitalPeriod: '225 Earth days',
        diameter: '12,104 km',
        moonCount: '0',
        description: 'Venus is often called Earth\'s twin because of their similar size. However, its thick toxic atmosphere creates an extreme greenhouse effect.',
        funFact: 'Venus rotates backwards compared to most planets, so the Sun rises in the west!',
        hasAtmosphere: true,
        moons: []
    },
    
    earth: {
        name: 'Earth',
        icon: '🌍',
        type: 'Terrestrial Planet',
        color: 0x4a90d9,
        size: 1,
        distance: 18,
        orbitSpeed: 2.98,
        tilt: 23.44,
        distanceFromSun: '149.6 million km',
        orbitalPeriod: '365.25 days',
        diameter: '12,742 km',
        moonCount: '1',
        description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth\'s surface is water.',
        funFact: 'Earth is the only planet not named after a Greek or Roman god!',
        hasAtmosphere: true,
        moons: [
            {
                name: 'Moon',
                size: 0.27,
                distance: 2,
                orbitSpeed: 2,
                color: 0xaaaaaa
            }
        ]
    },
    
    mars: {
        name: 'Mars',
        icon: '🔴',
        type: 'Terrestrial Planet',
        color: 0xc1440e,
        size: 0.5,
        distance: 24,
        orbitSpeed: 2.41,
        tilt: 25.19,
        distanceFromSun: '227.9 million km',
        orbitalPeriod: '687 Earth days',
        diameter: '6,779 km',
        moonCount: '2',
        description: 'Mars is known as the Red Planet due to iron oxide on its surface. It has the largest volcano and canyon in the solar system.',
        funFact: 'Olympus Mons on Mars is the largest volcano in the solar system, 3x taller than Everest!',
        hasAtmosphere: true,
        moons: [
            {
                name: 'Phobos',
                size: 0.1,
                distance: 1.2,
                orbitSpeed: 3,
                color: 0x888888
            },
            {
                name: 'Deimos',
                size: 0.08,
                distance: 1.8,
                orbitSpeed: 2,
                color: 0x999999
            }
        ]
    },
    
    jupiter: {
        name: 'Jupiter',
        icon: '🟤',
        type: 'Gas Giant',
        color: 0xd4a574,
        size: 3,
        distance: 38,
        orbitSpeed: 1.31,
        tilt: 3.13,
        distanceFromSun: '778.5 million km',
        orbitalPeriod: '11.86 Earth years',
        diameter: '139,820 km',
        moonCount: '95',
        description: 'Jupiter is the largest planet in our solar system. Its Great Red Spot is a storm that has been raging for at least 400 years.',
        funFact: 'Jupiter has the shortest day of all planets - it rotates once every 10 hours!',
        hasAtmosphere: true,
        moons: [
            {
                name: 'Io',
                size: 0.28,
                distance: 4,
                orbitSpeed: 2.5,
                color: 0xffff99
            },
            {
                name: 'Europa',
                size: 0.24,
                distance: 5,
                orbitSpeed: 2,
                color: 0xc9b997
            },
            {
                name: 'Ganymede',
                size: 0.4,
                distance: 6.5,
                orbitSpeed: 1.5,
                color: 0x888888
            },
            {
                name: 'Callisto',
                size: 0.38,
                distance: 8,
                orbitSpeed: 1,
                color: 0x555555
            }
        ]
    },
    
    saturn: {
        name: 'Saturn',
        icon: '🪐',
        type: 'Gas Giant',
        color: 0xead6a6,
        size: 2.5,
        distance: 52,
        orbitSpeed: 0.97,
        tilt: 26.73,
        distanceFromSun: '1.4 billion km',
        orbitalPeriod: '29.46 Earth years',
        diameter: '116,460 km',
        moonCount: '146',
        description: 'Saturn is famous for its stunning ring system made of ice and rock. It\'s the least dense planet - it could float in water!',
        funFact: 'Saturn\'s rings span up to 282,000 km but are only about 10 meters thick!',
        hasAtmosphere: true,
        moons: [
            {
                name: 'Titan',
                size: 0.4,
                distance: 5,
                orbitSpeed: 1.5,
                color: 0xffcc66
            },
            {
                name: 'Enceladus',
                size: 0.15,
                distance: 3.5,
                orbitSpeed: 2,
                color: 0xffffff
            }
        ]
    },
    
    uranus: {
        name: 'Uranus',
        icon: '🔵',
        type: 'Ice Giant',
        color: 0x7de3f4,
        size: 1.8,
        distance: 66,
        orbitSpeed: 0.68,
        tilt: 97.77,
        distanceFromSun: '2.9 billion km',
        orbitalPeriod: '84 Earth years',
        diameter: '50,724 km',
        moonCount: '28',
        description: 'Uranus is an ice giant with a unique sideways rotation. Its blue-green color comes from methane in its atmosphere.',
        funFact: 'Uranus rotates on its side, possibly due to a collision with an Earth-sized object long ago!',
        hasAtmosphere: true,
        moons: [
            {
                name: 'Miranda',
                size: 0.15,
                distance: 2.5,
                orbitSpeed: 2,
                color: 0xaaaaaa
            },
            {
                name: 'Titania',
                size: 0.25,
                distance: 4,
                orbitSpeed: 1.5,
                color: 0x888888
            }
        ]
    },
    
    neptune: {
        name: 'Neptune',
        icon: '🔷',
        type: 'Ice Giant',
        color: 0x4b70dd,
        size: 1.7,
        distance: 78,
        orbitSpeed: 0.54,
        tilt: 28.32,
        distanceFromSun: '4.5 billion km',
        orbitalPeriod: '164.8 Earth years',
        diameter: '49,244 km',
        moonCount: '16',
        description: 'Neptune is the windiest planet with storms that can reach 2,100 km/h. It was discovered through mathematical predictions.',
        funFact: 'Neptune has only completed one orbit around the Sun since its discovery in 1846!',
        hasAtmosphere: true,
        moons: [
            {
                name: 'Triton',
                size: 0.35,
                distance: 3.5,
                orbitSpeed: 1.5,
                color: 0xffcccc
            }
        ]
    }
};

export const SPACE_FACTS = [
    "Did you know? The Sun contains 99.86% of the mass in the Solar System.",
    "Fun fact: A year on Mercury is just 88 Earth days!",
    "Amazing: Light from the Sun takes 8 minutes to reach Earth.",
    "Cool fact: Saturn's density is so low it would float in water!",
    "Interesting: The Great Red Spot on Jupiter is larger than Earth.",
    "Wow: One day on Venus is longer than one year on Venus!",
    "Mind-blowing: There are more stars in the universe than grains of sand on Earth.",
    "Did you know? Neutron stars can spin 600 times per second!",
    "Fun fact: The footprints on the Moon will be there for 100 million years.",
    "Amazing: Space is completely silent because there's no atmosphere.",
    "Cool fact: A spacesuit costs $12 million to make!",
    "Interesting: The largest asteroid, Ceres, contains 1/3 of the asteroid belt's mass.",
    "Wow: Mars has the tallest mountain in the solar system - Olympus Mons!",
    "Mind-blowing: There may be a planet made entirely of diamonds!",
    "Did you know? The Milky Way and Andromeda galaxies will collide in 4 billion years."
];
