const https = require('https');

https.get('https://marine-api.open-meteo.com/v1/marine?latitude=-34.61&longitude=-58.38&hourly=sea_level_height_msl&forecast_days=1&timezone=America/Argentina/Buenos_Aires', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const times = json.hourly.time;
    const heights = json.hourly.sea_level_height_msl;
    for(let i=0; i<times.length; i++) {
        console.log(`${times[i]}: ${heights[i]}`);
    }
  });
});
