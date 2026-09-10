// Indian Geo-Location & Nearest FSI Regulatory Zone Resolver
// Uses Geolocation API + Offline Haversine Coordinate Distance Calculation + Reverse Geocoding

export interface CityCoordinate {
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  lat: number;
  lng: number;
}

export const INDIAN_CITIES_COORDINATES: CityCoordinate[] = [
  { stateId: "andhra_pradesh", stateName: "Andhra Pradesh", cityId: "visakhapatnam", cityName: "Visakhapatnam (Vizag)", lat: 17.6868, lng: 83.2185 },
  { stateId: "andhra_pradesh", stateName: "Andhra Pradesh", cityId: "vijayawada", cityName: "Vijayawada", lat: 16.5062, lng: 80.648 },
  { stateId: "andhra_pradesh", stateName: "Andhra Pradesh", cityId: "amaravati", cityName: "Amaravati (Capital City)", lat: 16.5131, lng: 80.5158 },
  { stateId: "andhra_pradesh", stateName: "Andhra Pradesh", cityId: "guntur", cityName: "Guntur", lat: 16.3067, lng: 80.4365 },
  { stateId: "andhra_pradesh", stateName: "Andhra Pradesh", cityId: "tirupati", cityName: "Tirupati", lat: 13.6288, lng: 79.4192 },
  { stateId: "arunachal_pradesh", stateName: "Arunachal Pradesh", cityId: "itanagar", cityName: "Itanagar", lat: 27.0844, lng: 93.6053 },
  { stateId: "arunachal_pradesh", stateName: "Arunachal Pradesh", cityId: "naharlagun", cityName: "Naharlagun", lat: 27.1066, lng: 93.6933 },
  { stateId: "assam", stateName: "Assam", cityId: "guwahati", cityName: "Guwahati", lat: 26.1445, lng: 91.7362 },
  { stateId: "assam", stateName: "Assam", cityId: "dibrugarh", cityName: "Dibrugarh", lat: 27.4728, lng: 94.912 },
  { stateId: "assam", stateName: "Assam", cityId: "silchar", cityName: "Silchar", lat: 24.8333, lng: 92.7789 },
  { stateId: "bihar", stateName: "Bihar", cityId: "patna", cityName: "Patna", lat: 25.5941, lng: 85.1376 },
  { stateId: "bihar", stateName: "Bihar", cityId: "gaya", cityName: "Gaya", lat: 24.7914, lng: 85.0002 },
  { stateId: "bihar", stateName: "Bihar", cityId: "muzaffarpur", cityName: "Muzaffarpur", lat: 26.1209, lng: 85.3647 },
  { stateId: "chhattisgarh", stateName: "Chhattisgarh", cityId: "raipur", cityName: "Raipur & Nava Raipur (Atal Nagar)", lat: 21.2514, lng: 81.6296 },
  { stateId: "chhattisgarh", stateName: "Chhattisgarh", cityId: "bilaspur", cityName: "Bilaspur", lat: 22.0797, lng: 82.1409 },
  { stateId: "chhattisgarh", stateName: "Chhattisgarh", cityId: "durg_bhilai", cityName: "Durg - Bhilai", lat: 20.5937, lng: 78.9629 },
  { stateId: "goa", stateName: "Goa", cityId: "panaji", cityName: "Panaji (North Goa)", lat: 15.4909, lng: 73.8278 },
  { stateId: "goa", stateName: "Goa", cityId: "margao", cityName: "Margao (South Goa)", lat: 15.2832, lng: 73.9862 },
  { stateId: "goa", stateName: "Goa", cityId: "vasco_da_gama", cityName: "Vasco da Gama", lat: 20.5937, lng: 78.9629 },
  { stateId: "gujarat", stateName: "Gujarat", cityId: "ahmedabad", cityName: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { stateId: "gujarat", stateName: "Gujarat", cityId: "surat", cityName: "Surat", lat: 21.1702, lng: 72.8311 },
  { stateId: "gujarat", stateName: "Gujarat", cityId: "vadodara", cityName: "Vadodara", lat: 22.3072, lng: 73.1812 },
  { stateId: "gujarat", stateName: "Gujarat", cityId: "gandhinagar", cityName: "Gandhinagar (GIFT City)", lat: 23.2156, lng: 72.6369 },
  { stateId: "gujarat", stateName: "Gujarat", cityId: "rajkot", cityName: "Rajkot", lat: 22.3039, lng: 70.8022 },
  { stateId: "haryana", stateName: "Haryana", cityId: "gurugram", cityName: "Gurugram (Gurgaon)", lat: 28.4595, lng: 77.0266 },
  { stateId: "haryana", stateName: "Haryana", cityId: "faridabad", cityName: "Faridabad", lat: 28.4089, lng: 77.3178 },
  { stateId: "haryana", stateName: "Haryana", cityId: "panchkula", cityName: "Panchkula", lat: 30.6942, lng: 76.8606 },
  { stateId: "haryana", stateName: "Haryana", cityId: "panipat", cityName: "Panipat", lat: 29.3909, lng: 76.9635 },
  { stateId: "himachal_pradesh", stateName: "Himachal Pradesh", cityId: "shimla", cityName: "Shimla", lat: 31.1048, lng: 77.1734 },
  { stateId: "himachal_pradesh", stateName: "Himachal Pradesh", cityId: "dharamshala", cityName: "Dharamshala", lat: 32.219, lng: 76.3234 },
  { stateId: "himachal_pradesh", stateName: "Himachal Pradesh", cityId: "solan", cityName: "Solan", lat: 30.9045, lng: 77.0967 },
  { stateId: "jharkhand", stateName: "Jharkhand", cityId: "ranchi", cityName: "Ranchi", lat: 23.3441, lng: 85.3096 },
  { stateId: "jharkhand", stateName: "Jharkhand", cityId: "jamshedpur", cityName: "Jamshedpur", lat: 22.8046, lng: 86.2029 },
  { stateId: "jharkhand", stateName: "Jharkhand", cityId: "dhanbad", cityName: "Dhanbad", lat: 23.7957, lng: 86.4304 },
  { stateId: "karnataka", stateName: "Karnataka", cityId: "bengaluru", cityName: "Bengaluru (Bangalore)", lat: 12.9716, lng: 77.5946 },
  { stateId: "karnataka", stateName: "Karnataka", cityId: "mysuru", cityName: "Mysuru (Mysore)", lat: 12.2958, lng: 76.6394 },
  { stateId: "karnataka", stateName: "Karnataka", cityId: "mangaluru", cityName: "Mangaluru (Mangalore)", lat: 12.9141, lng: 74.856 },
  { stateId: "karnataka", stateName: "Karnataka", cityId: "hubballi_dharwad", cityName: "Hubballi - Dharwad", lat: 15.3647, lng: 75.124 },
  { stateId: "karnataka", stateName: "Karnataka", cityId: "belagavi", cityName: "Belagavi (Belgaum)", lat: 15.8497, lng: 74.4977 },
  { stateId: "kerala", stateName: "Kerala", cityId: "kochi", cityName: "Kochi (Cochin)", lat: 9.9312, lng: 76.2673 },
  { stateId: "kerala", stateName: "Kerala", cityId: "thiruvananthapuram", cityName: "Thiruvananthapuram (Trivandrum)", lat: 8.5241, lng: 76.9366 },
  { stateId: "kerala", stateName: "Kerala", cityId: "kozhikode", cityName: "Kozhikode (Calicut)", lat: 11.2588, lng: 75.7804 },
  { stateId: "kerala", stateName: "Kerala", cityId: "thrissur", cityName: "Thrissur", lat: 10.5276, lng: 76.2144 },
  { stateId: "madhya_pradesh", stateName: "Madhya Pradesh", cityId: "indore", cityName: "Indore", lat: 22.7196, lng: 75.8577 },
  { stateId: "madhya_pradesh", stateName: "Madhya Pradesh", cityId: "bhopal", cityName: "Bhopal", lat: 23.2599, lng: 77.4126 },
  { stateId: "madhya_pradesh", stateName: "Madhya Pradesh", cityId: "jabalpur", cityName: "Jabalpur", lat: 23.1815, lng: 79.9864 },
  { stateId: "madhya_pradesh", stateName: "Madhya Pradesh", cityId: "gwalior", cityName: "Gwalior", lat: 26.2183, lng: 78.1828 },
  { stateId: "madhya_pradesh", stateName: "Madhya Pradesh", cityId: "ujjain", cityName: "Ujjain", lat: 23.1765, lng: 75.7885 },
  { stateId: "maharashtra", stateName: "Maharashtra", cityId: "mumbai", cityName: "Mumbai (MCGM)", lat: 19.076, lng: 72.8777 },
  { stateId: "maharashtra", stateName: "Maharashtra", cityId: "pune", cityName: "Pune (PMC & PCMC)", lat: 18.5204, lng: 73.8567 },
  { stateId: "maharashtra", stateName: "Maharashtra", cityId: "nagpur", cityName: "Nagpur", lat: 21.1458, lng: 79.0882 },
  { stateId: "maharashtra", stateName: "Maharashtra", cityId: "nashik", cityName: "Nashik", lat: 19.9975, lng: 73.7898 },
  { stateId: "maharashtra", stateName: "Maharashtra", cityId: "thane", cityName: "Thane", lat: 19.2183, lng: 72.9781 },
  { stateId: "maharashtra", stateName: "Maharashtra", cityId: "navi_mumbai", cityName: "Navi Mumbai", lat: 19.033, lng: 73.0297 },
  { stateId: "maharashtra", stateName: "Maharashtra", cityId: "chhatrapati_sambhajinagar", cityName: "Chhatrapati Sambhajinagar (Aurangabad)", lat: 20.5937, lng: 78.9629 },
  { stateId: "manipur", stateName: "Manipur", cityId: "imphal", cityName: "Imphal", lat: 24.817, lng: 93.9368 },
  { stateId: "meghalaya", stateName: "Meghalaya", cityId: "shillong", cityName: "Shillong", lat: 25.5788, lng: 91.8933 },
  { stateId: "mizoram", stateName: "Mizoram", cityId: "aizawl", cityName: "Aizawl", lat: 23.7271, lng: 92.7176 },
  { stateId: "nagaland", stateName: "Nagaland", cityId: "kohima", cityName: "Kohima", lat: 25.6751, lng: 94.1086 },
  { stateId: "nagaland", stateName: "Nagaland", cityId: "dimapur", cityName: "Dimapur", lat: 25.9068, lng: 93.7272 },
  { stateId: "odisha", stateName: "Odisha", cityId: "bhubaneswar", cityName: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  { stateId: "odisha", stateName: "Odisha", cityId: "cuttack", cityName: "Cuttack", lat: 20.4625, lng: 85.8828 },
  { stateId: "odisha", stateName: "Odisha", cityId: "rourkela", cityName: "Rourkela", lat: 22.2604, lng: 84.8536 },
  { stateId: "odisha", stateName: "Odisha", cityId: "puri", cityName: "Puri", lat: 19.8135, lng: 85.8312 },
  { stateId: "punjab", stateName: "Punjab", cityId: "ludhiana", cityName: "Ludhiana", lat: 30.901, lng: 75.8573 },
  { stateId: "punjab", stateName: "Punjab", cityId: "mohali", cityName: "Mohali (SAS Nagar)", lat: 30.7046, lng: 76.7179 },
  { stateId: "punjab", stateName: "Punjab", cityId: "amritsar", cityName: "Amritsar", lat: 31.634, lng: 74.8723 },
  { stateId: "punjab", stateName: "Punjab", cityId: "jalandhar", cityName: "Jalandhar", lat: 31.326, lng: 75.5762 },
  { stateId: "rajasthan", stateName: "Rajasthan", cityId: "jaipur", cityName: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { stateId: "rajasthan", stateName: "Rajasthan", cityId: "jodhpur", cityName: "Jodhpur", lat: 26.2389, lng: 73.0243 },
  { stateId: "rajasthan", stateName: "Rajasthan", cityId: "udaipur", cityName: "Udaipur", lat: 24.5854, lng: 73.7125 },
  { stateId: "rajasthan", stateName: "Rajasthan", cityId: "kota", cityName: "Kota", lat: 25.2138, lng: 75.8648 },
  { stateId: "sikkim", stateName: "Sikkim", cityId: "gangtok", cityName: "Gangtok", lat: 27.3389, lng: 88.6065 },
  { stateId: "tamil_nadu", stateName: "Tamil Nadu", cityId: "chennai", cityName: "Chennai", lat: 13.0827, lng: 80.2707 },
  { stateId: "tamil_nadu", stateName: "Tamil Nadu", cityId: "coimbatore", cityName: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { stateId: "tamil_nadu", stateName: "Tamil Nadu", cityId: "madurai", cityName: "Madurai", lat: 9.9252, lng: 78.1198 },
  { stateId: "tamil_nadu", stateName: "Tamil Nadu", cityId: "tiruchirappalli", cityName: "Tiruchirappalli (Trichy)", lat: 10.7905, lng: 78.7047 },
  { stateId: "tamil_nadu", stateName: "Tamil Nadu", cityId: "salem", cityName: "Salem", lat: 11.6643, lng: 78.146 },
  { stateId: "telangana", stateName: "Telangana", cityId: "hyderabad", cityName: "Hyderabad (GHMC & HMDA)", lat: 17.385, lng: 78.4867 },
  { stateId: "telangana", stateName: "Telangana", cityId: "warangal", cityName: "Warangal", lat: 17.9689, lng: 79.5941 },
  { stateId: "telangana", stateName: "Telangana", cityId: "nizamabad", cityName: "Nizamabad", lat: 18.6725, lng: 78.0941 },
  { stateId: "telangana", stateName: "Telangana", cityId: "karimnagar", cityName: "Karimnagar", lat: 18.4386, lng: 79.1288 },
  { stateId: "tripura", stateName: "Tripura", cityId: "agartala", cityName: "Agartala", lat: 23.8315, lng: 91.2868 },
  { stateId: "uttar_pradesh", stateName: "Uttar Pradesh", cityId: "noida", cityName: "Noida", lat: 28.5355, lng: 77.391 },
  { stateId: "uttar_pradesh", stateName: "Uttar Pradesh", cityId: "greater_noida", cityName: "Greater Noida & Yamuna Expressway (YEIDA)", lat: 28.4744, lng: 77.504 },
  { stateId: "uttar_pradesh", stateName: "Uttar Pradesh", cityId: "lucknow", cityName: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { stateId: "uttar_pradesh", stateName: "Uttar Pradesh", cityId: "kanpur", cityName: "Kanpur", lat: 26.4499, lng: 80.3319 },
  { stateId: "uttar_pradesh", stateName: "Uttar Pradesh", cityId: "varanasi", cityName: "Varanasi (Kashi)", lat: 25.3176, lng: 82.9739 },
  { stateId: "uttar_pradesh", stateName: "Uttar Pradesh", cityId: "agra", cityName: "Agra", lat: 27.1767, lng: 78.0081 },
  { stateId: "uttar_pradesh", stateName: "Uttar Pradesh", cityId: "ghaziabad", cityName: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { stateId: "uttar_pradesh", stateName: "Uttar Pradesh", cityId: "prayagraj", cityName: "Prayagraj (Allahabad)", lat: 25.4358, lng: 81.8463 },
  { stateId: "uttarakhand", stateName: "Uttarakhand", cityId: "dehradun", cityName: "Dehradun", lat: 30.3165, lng: 78.0322 },
  { stateId: "uttarakhand", stateName: "Uttarakhand", cityId: "haridwar", cityName: "Haridwar & Roorkee", lat: 29.9457, lng: 78.1642 },
  { stateId: "uttarakhand", stateName: "Uttarakhand", cityId: "haldwani", cityName: "Haldwani - Nainital", lat: 29.2183, lng: 79.513 },
  { stateId: "uttarakhand", stateName: "Uttarakhand", cityId: "rishikesh", cityName: "Rishikesh", lat: 30.0869, lng: 78.2676 },
  { stateId: "west_bengal", stateName: "West Bengal", cityId: "kolkata", cityName: "Kolkata (KMC)", lat: 22.5726, lng: 88.3639 },
  { stateId: "west_bengal", stateName: "West Bengal", cityId: "howrah", cityName: "Howrah", lat: 22.5958, lng: 88.2636 },
  { stateId: "west_bengal", stateName: "West Bengal", cityId: "siliguri", cityName: "Siliguri", lat: 26.7271, lng: 88.3953 },
  { stateId: "west_bengal", stateName: "West Bengal", cityId: "durgapur_asansol", cityName: "Durgapur - Asansol", lat: 23.5204, lng: 87.3119 },
  { stateId: "delhi_nct", stateName: "Delhi (NCT)", cityId: "delhi", cityName: "Delhi (All Zones / MCD / DDA)", lat: 28.6139, lng: 77.209 },
  { stateId: "delhi_nct", stateName: "Delhi (NCT)", cityId: "dwarka", cityName: "Dwarka Sub-City", lat: 20.5937, lng: 78.9629 },
  { stateId: "delhi_nct", stateName: "Delhi (NCT)", cityId: "rohini", cityName: "Rohini Sub-City", lat: 20.5937, lng: 78.9629 },
  { stateId: "chandigarh_ut", stateName: "Chandigarh (UT)", cityId: "chandigarh", cityName: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { stateId: "jammu_kashmir", stateName: "Jammu & Kashmir (UT)", cityId: "srinagar", cityName: "Srinagar", lat: 34.0837, lng: 74.7973 },
  { stateId: "jammu_kashmir", stateName: "Jammu & Kashmir (UT)", cityId: "jammu", cityName: "Jammu", lat: 32.7266, lng: 74.857 },
  { stateId: "ladakh_ut", stateName: "Ladakh (UT)", cityId: "leh", cityName: "Leh", lat: 34.1526, lng: 77.5771 },
  { stateId: "ladakh_ut", stateName: "Ladakh (UT)", cityId: "kargil", cityName: "Kargil", lat: 34.5539, lng: 76.1349 },
  { stateId: "puducherry_ut", stateName: "Puducherry (UT)", cityId: "puducherry", cityName: "Puducherry (Pondicherry)", lat: 11.9416, lng: 79.8083 },
  { stateId: "dadra_daman_diu", stateName: "Dadra & Nagar Haveli and Daman & Diu (UT)", cityId: "daman", cityName: "Daman", lat: 20.3974, lng: 72.8328 },
  { stateId: "dadra_daman_diu", stateName: "Dadra & Nagar Haveli and Daman & Diu (UT)", cityId: "silvassa", cityName: "Silvassa", lat: 20.2763, lng: 73.0083 },
  { stateId: "andaman_nicobar", stateName: "Andaman & Nicobar Islands (UT)", cityId: "port_blair", cityName: "Port Blair", lat: 11.6234, lng: 92.7265 },
];

// Calculate distance in kilometers between two coordinates via Haversine formula
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DetectedLocationResult {
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  source: 'gps' | 'ip' | 'nearest_city';
}

// Resolve closest Indian city and state from latitude and longitude
export function findNearestIndianCity(lat: number, lng: number): DetectedLocationResult {
  let closest = INDIAN_CITIES_COORDINATES[0];
  let minDistance = Infinity;

  for (const city of INDIAN_CITIES_COORDINATES) {
    const dist = calculateHaversineDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return {
    stateId: closest.stateId,
    stateName: closest.stateName,
    cityId: closest.cityId,
    cityName: closest.cityName,
    distanceKm: Math.round(minDistance * 10) / 10,
    latitude: lat,
    longitude: lng,
    source: 'nearest_city'
  };
}

// Full async browser geolocation detector with reverse geocoding enhancement
export async function detectUserIndianLocation(): Promise<DetectedLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        // 1. First find nearest Indian city via offline coordinate index
        const nearest = findNearestIndianCity(lat, lng);

        // 2. Try online reverse geocode for exact administrative match (e.g. Pune vs Mumbai in Maharashtra)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const returnedCity = (data.city || data.locality || data.principalSubdivision || '').toLowerCase();
            const returnedState = (data.principalSubdivision || '').toLowerCase();

            // Try to match returned city or state directly in our dataset
            const exactCityMatch = INDIAN_CITIES_COORDINATES.find((c) => {
              const cName = c.cityName.toLowerCase();
              const cId = c.cityId.toLowerCase();
              return (
                returnedCity.includes(cId) ||
                cId.includes(returnedCity) ||
                cName.includes(returnedCity) ||
                returnedCity.includes(cName)
              );
            });

            if (exactCityMatch) {
              const dist = calculateHaversineDistance(lat, lng, exactCityMatch.lat, exactCityMatch.lng);
              resolve({
                stateId: exactCityMatch.stateId,
                stateName: exactCityMatch.stateName,
                cityId: exactCityMatch.cityId,
                cityName: exactCityMatch.cityName,
                distanceKm: Math.round(dist * 10) / 10,
                latitude: lat,
                longitude: lng,
                accuracyMeters: accuracy,
                source: 'gps'
              });
              return;
            }

            // If state matched, find closest city within that state
            const stateCities = INDIAN_CITIES_COORDINATES.filter((c) => {
              const sName = c.stateName.toLowerCase();
              const sId = c.stateId.toLowerCase();
              return (
                returnedState.includes(sId) ||
                sId.includes(returnedState) ||
                sName.includes(returnedState) ||
                returnedState.includes(sName)
              );
            });

            if (stateCities.length > 0) {
              let closestInState = stateCities[0];
              let minStateDist = Infinity;
              for (const sc of stateCities) {
                const dist = calculateHaversineDistance(lat, lng, sc.lat, sc.lng);
                if (dist < minStateDist) {
                  minStateDist = dist;
                  closestInState = sc;
                }
              }

              resolve({
                stateId: closestInState.stateId,
                stateName: closestInState.stateName,
                cityId: closestInState.cityId,
                cityName: closestInState.cityName,
                distanceKm: Math.round(minStateDist * 10) / 10,
                latitude: lat,
                longitude: lng,
                accuracyMeters: accuracy,
                source: 'gps'
              });
              return;
            }
          }
        } catch {
          // Ignore network errors and fall through to nearest coordinate match
        }

        // Return nearest coordinate match
        resolve({
          ...nearest,
          accuracyMeters: accuracy,
          source: 'gps'
        });
      },
      (err) => {
        let msg = 'Unable to retrieve location.';
        if (err.code === 1) msg = 'Location access was denied. Please select your State & City from the dropdowns.';
        else if (err.code === 2) msg = 'Location position unavailable. Please select your city manually.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again or select manually.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  });
}
