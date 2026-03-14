import api from './api'

export const getLawyers = async (filters = {}) => {
  if (filters.city) {
    const query = `
      [out:json][timeout:25];
      area["name"="${filters.city}"]->.searchArea;
      (
        node["office"="lawyer"](area.searchArea);
        way["office"="lawyer"](area.searchArea);
        relation["office"="lawyer"](area.searchArea);
      );
      out tags center;
    `;
    
    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "data=" + encodeURIComponent(query)
      });
      
      if (!response.ok) throw new Error("Overpass API request failed");
      const data = await response.json();
      
      const elements = data.elements || [];
      const osmLawyers = elements.slice(0, 20).map(el => {
        const tags = el.tags || {};
        const name = tags.name || tags.operator || "Legal Professional";
        
        const addressParts = [
          tags["addr:housenumber"],
          tags["addr:street"],
          tags["addr:city"],
          tags["addr:state"],
          tags["addr:postcode"]
        ].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : filters.city;
        
        return {
          id: `osm_${el.id}`,
          name: name,
          specializations: ["GENERAL"],
          experience_years: 0,
          location_city: filters.city,
          location_state: tags["addr:state"] || "Unknown",
          languages: ["Unknown"],
          about: tags.description || `Law office listed on OpenStreetMap as ${name}`,
          hourly_rate: 0,
          contact_email: tags.email || "",
          contact_phone: tags.phone || tags["contact:phone"] || "",
          contact_website: tags.website || tags["contact:website"] || "",
          full_address: fullAddress,
          rating: 0,
          reviews_count: 0,
          status: "available",
          verified: true,
          lat: el.lat || (el.center && el.center.lat) || 0,
          lon: el.lon || (el.center && el.center.lon) || 0
        };
      });

      // Simple frontend filtering for specialization
      if (filters.specialization) {
        return osmLawyers.filter(l => 
          l.specializations.includes(filters.specialization.toUpperCase())
        );
      }

      return osmLawyers;
    } catch (error) {
      console.error("Failed to fetch from OSM:", error);
      return [];
    }
  }

  return [];
}

export const getLawyerDetails = async (id) => {
  const response = await api.get(`/api/v1/lawyers/${id}`)
  return response.data
}

export const registerLawyer = async (lawyerData) => {
  const response = await api.post('/api/v1/lawyers/register', lawyerData)
  return response.data
}

export const requestConsultation = async (consultationData) => {
  const response = await api.post('/api/v1/lawyers/connect-lawyer', consultationData)
  return response.data
}
