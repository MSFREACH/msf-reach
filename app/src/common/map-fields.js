export const TILELAYER_TERRAIN = {
    URL: 'https://api.mapbox.com/styles/v1/acrossthecloud/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpvOGEzMDd3aTJzbXo4N2FnNmVhYyJ9.RKQohxz22Xpyn4Y8S1BjfQ',
    OPTIONS: {
        attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
        minZoom: 0,
        maxZoom: 18
    }
};

export const TILELAYER_SATELLITE = {
    URL: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ',
    OPTIONS: {
        attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
    }
};

export const TILELAYER_HOTOSM = {
    URL: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    OPTIONS: {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
    }
};
