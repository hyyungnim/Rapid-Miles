export interface Landmark {
  name: string;
  lat: number;
  lng: number;
  category: string;
}

export const ILORIN_LANDMARKS: Landmark[] = [
  // Neighborhoods & areas
  { name: "Tanke, Ilorin", lat: 8.4793, lng: 4.5525, category: "Neighborhood" },
  { name: "GRA Ilorin", lat: 8.4967, lng: 4.5426, category: "Neighborhood" },
  { name: "Adewole, Ilorin", lat: 8.5112, lng: 4.5628, category: "Neighborhood" },
  { name: "Surulere, Ilorin", lat: 8.4889, lng: 4.5689, category: "Neighborhood" },
  { name: "Agbo Oba, Ilorin", lat: 8.5042, lng: 4.5789, category: "Neighborhood" },
  { name: "Oko Erin, Ilorin", lat: 8.4782, lng: 4.5213, category: "Neighborhood" },
  { name: "Sango, Ilorin", lat: 8.5147, lng: 4.5492, category: "Neighborhood" },
  { name: "Pakata, Ilorin", lat: 8.5061, lng: 4.5228, category: "Neighborhood" },
  { name: "Oloje, Ilorin", lat: 8.4911, lng: 4.5097, category: "Neighborhood" },
  { name: "Baboko, Ilorin", lat: 8.5189, lng: 4.5339, category: "Neighborhood" },
  { name: "Ita Alamu, Ilorin", lat: 8.5025, lng: 4.5356, category: "Neighborhood" },
  { name: "Maraba, Ilorin", lat: 8.4722, lng: 4.5467, category: "Neighborhood" },
  { name: "Pipeline Area, Ilorin", lat: 8.4864, lng: 4.5803, category: "Neighborhood" },
  { name: "Fate, Ilorin", lat: 8.4697, lng: 4.5639, category: "Neighborhood" },
  { name: "Ganmo, Ilorin", lat: 8.4514, lng: 4.5986, category: "Neighborhood" },

  // Markets
  { name: "Oja Oba (King's Market), Ilorin", lat: 8.5019, lng: 4.5411, category: "Market" },
  { name: "Mandate Market (Oje Market), Ilorin", lat: 8.4925, lng: 4.5303, category: "Market" },
  { name: "Ipata Market, Ilorin", lat: 8.5067, lng: 4.5167, category: "Market" },
  { name: "Kulende Market, Ilorin", lat: 8.4781, lng: 4.5658, category: "Market" },

  // Institutions & schools
  { name: "University of Ilorin (Unilorin) Main Campus", lat: 8.4961, lng: 4.6742, category: "Institution" },
  { name: "Unilorin Dam, Ilorin", lat: 8.4833, lng: 4.6667, category: "Institution" },
  { name: "Kwara State University (KWASU) Ilorin Campus", lat: 8.5069, lng: 4.5486, category: "Institution" },
  { name: "Kwara Polytechnic, Ilorin", lat: 8.4808, lng: 4.5553, category: "Institution" },
  { name: "Kwara State College of Education, Ilorin", lat: 8.4708, lng: 4.5681, category: "Institution" },
  { name: "Kwara State University Teaching Hospital", lat: 8.4875, lng: 4.5639, category: "Institution" },
  { name: "University of Ilorin Teaching Hospital (UITH)", lat: 8.4875, lng: 4.5639, category: "Institution" },

  // Roads (major)
  { name: "Taiwo Road, Ilorin", lat: 8.4975, lng: 4.5417, category: "Road" },
  { name: "Offa Road, Ilorin", lat: 8.4778, lng: 4.5572, category: "Road" },
  { name: "Asa Dam Road, Ilorin", lat: 8.5139, lng: 4.5361, category: "Road" },
  { name: "Ahmadu Bello Way, Ilorin", lat: 8.5058, lng: 4.5439, category: "Road" },
  { name: "Unity Road, Ilorin", lat: 8.4875, lng: 4.5469, category: "Road" },
  { name: "University Road, Ilorin", lat: 8.4917, lng: 4.6750, category: "Road" },
  { name: "Airport Road, Ilorin", lat: 8.5269, lng: 4.5097, category: "Road" },
  { name: "Jebba Road, Ilorin", lat: 8.5361, lng: 4.5222, category: "Road" },
  { name: "Stadium Road, Ilorin", lat: 8.4958, lng: 4.5500, category: "Road" },
  { name: "Yidi Road, Ilorin", lat: 8.4861, lng: 4.5333, category: "Road" },
  { name: "Coca-Cola Road, Ilorin", lat: 8.4833, lng: 4.5472, category: "Road" },

  // Transport
  { name: "Ilorin International Airport", lat: 8.5283, lng: 4.5014, category: "Transport" },
  { name: "Offa Garage, Ilorin", lat: 8.4769, lng: 4.5592, category: "Transport" },
  { name: "Maraba Motor Park, Ilorin", lat: 8.4722, lng: 4.5467, category: "Transport" },
  { name: "Ilorin Central Motor Park (Post Office)", lat: 8.4972, lng: 4.5403, category: "Transport" },
  { name: "Kaiama Garage, Ilorin", lat: 8.4819, lng: 4.5408, category: "Transport" },

  // Hotels & venues
  { name: "Kwara Hotel, Ilorin", lat: 8.4953, lng: 4.5486, category: "Hotel" },
  { name: "Apata Grand Hotel, Ilorin", lat: 8.4856, lng: 4.5589, category: "Hotel" },
  { name: "Whalex Hotel, Ilorin", lat: 8.4786, lng: 4.5486, category: "Hotel" },
  { name: "Lafiagi Hotel, Ilorin", lat: 8.4911, lng: 4.5453, category: "Hotel" },
  { name: "Owode Guest House, Ilorin", lat: 8.4925, lng: 4.5519, category: "Hotel" },
  { name: "MicCom Golf Hotel, Ilorin", lat: 8.5069, lng: 4.6639, category: "Hotel" },

  // Government
  { name: "Kwara State Government House, Ilorin", lat: 8.4897, lng: 4.5525, category: "Government" },
  { name: "Kwara State House of Assembly, Ilorin", lat: 8.4889, lng: 4.5539, category: "Government" },
  { name: "Ilorin West Local Government Secretariat", lat: 8.4786, lng: 4.5558, category: "Government" },
  { name: "Ilorin East Local Government Secretariat", lat: 8.5069, lng: 4.5611, category: "Government" },
  { name: "Kwara State Ministry of Works, Ilorin", lat: 8.4875, lng: 4.5514, category: "Government" },
  { name: "Federal Secretariat, Ilorin", lat: 8.4931, lng: 4.5444, category: "Government" },
  { name: "Kwara State Internal Revenue Service (KW-IRS)", lat: 8.4958, lng: 4.5417, category: "Government" },

  // Health
  { name: "University of Ilorin Teaching Hospital (UITH)", lat: 8.4875, lng: 4.5639, category: "Health" },
  { name: "Kwara State General Hospital, Ilorin", lat: 8.5061, lng: 4.5453, category: "Health" },
  { name: "Sobi Specialist Hospital, Ilorin", lat: 8.5203, lng: 4.5306, category: "Health" },
  { name: "Bowen Hospital, Ilorin", lat: 8.4897, lng: 4.5489, category: "Health" },
  { name: "Life Care Hospital, Ilorin", lat: 8.4819, lng: 4.5564, category: "Health" },

  // Shopping & recreation
  { name: "Kwara Mall, Ilorin", lat: 8.4964, lng: 4.5519, category: "Shopping" },
  { name: "Gaa Akanbi Shopping Complex, Ilorin", lat: 8.4753, lng: 4.5603, category: "Shopping" },
  { name: "Kwara State Stadium, Ilorin", lat: 8.4958, lng: 4.5500, category: "Recreation" },
  { name: "Kwara State Polytechnic Stadium, Ilorin", lat: 8.4808, lng: 4.5553, category: "Recreation" },
  { name: "Ilorin Club, Ilorin", lat: 8.4942, lng: 4.5469, category: "Recreation" },
  { name: "Post Office Roundabout, Ilorin", lat: 8.4972, lng: 4.5403, category: "Landmark" },
  { name: "Challenge Roundabout, Ilorin", lat: 8.4986, lng: 4.5450, category: "Landmark" },
  { name: "Zango Junction, Ilorin", lat: 8.4825, lng: 4.5597, category: "Landmark" },
];

export function searchLandmarks(query: string): Landmark[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return ILORIN_LANDMARKS.filter(l =>
    l.name.toLowerCase().includes(q)
  ).slice(0, 10);
}
