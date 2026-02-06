import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import * as api from "../../services/api";

const FALLBACK_OPPORTUNITIES = [
  { id: "1", title: "CORPSAFRICA Volunteer Program", company: "MSME Africa", type: "Volunteering", location: "Multiple African Countries", button: "Apply" },
  { id: "2", title: "Content Writer – African Tech", company: "TechCabal", type: "Volunteering", location: "Remote", button: "Apply" },
];

function mapOpportunityFromApi(item) {
  if (!item) return null;

  return {
    id: String(item.id),
    title: item.title,
    company: item.location || "Remote",
    type: "Volunteering",
    location: item.location || "Remote",
    button: "Apply",
    _raw: item,
  };
}

const Opportunity = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  // ✅ FETCH REAL OPPORTUNITIES
  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.bookmark.opportunitiesList();
      // handle different backend shapes
const rawList =
  Array.isArray(data) ? data :
  Array.isArray(data?.results) ? data.results :
  [];

const arr = rawList.map(mapOpportunityFromApi).filter(Boolean);
      setList(arr);
      try {
        localStorage.setItem("opportunityListCache", JSON.stringify(rawList));
      } catch (_) {}
    } catch {
      setList(FALLBACK_OPPORTUNITIES);
      try {
        localStorage.setItem("opportunityListCache", JSON.stringify(FALLBACK_OPPORTUNITIES));
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedIds = useCallback(async () => {
    try {
      if (!api.getAccessToken()) return;
      const data = await api.bookmark.list();
      const raw = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const ids = new Set(raw.map((b) => String(b.opportunity_id ?? b.opportunity?.id ?? b.id)).filter(Boolean));
      setSavedIds(ids);
    } catch (_) {}
  }, []);
  

  useEffect(() => {
    document.title = "Opportunities - AfriVate";
    try {
      const q = sessionStorage.getItem("discoverQuery");
      if (q) {
        setSearch(q);
        sessionStorage.removeItem("discoverQuery");
      }
    } catch (_) {}
    loadOpportunities();
    loadSavedIds();
  }, [loadOpportunities, loadSavedIds]);

  const filteredList = list.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (item) => {
    try {
      await api.bookmark.opportunitiesSavedCreate({
        opportunity_id: Number(item.id),
      });
      setSavedIds((prev) => new Set([...prev, item.id]));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />

      <div className="pt-20 px-4 md:px-8 pb-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Opportunities</h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search opportunities..."
          className="w-full border rounded-full px-4 py-2 mb-4"
        />

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-2">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <h2 className="font-bold">{item.title}</h2>
                  <p className="text-sm text-gray-500">{item.company}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(item)}
                    className="px-3 py-1 rounded bg-gray-100 text-sm"
                  >
                    {savedIds.has(item.id) ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={() =>
                      navigate("/volunteer-details", { state: { job: item } })
                    }
                    className="bg-[#6A00B1] text-white px-4 py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunity;
