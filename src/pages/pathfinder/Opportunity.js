import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import { opportunities, bookmarks, applications } from "../../services/api";
import { getOrgName, navigateToVolunteerDetails } from "../../utils/opportunityUtils";

function mapOpportunityFromApi(item) {
  if (!item) return null;

  return {
    id: String(item.id),
    title: item.title,
    company: getOrgName(item),
    type: item.opportunity_type || "Volunteering",
    location: item.location || "",
    button: "Apply",
    _raw: item,
  };
}

const Opportunity = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedMap, setAppliedMap] = useState({});

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await opportunities.list({ is_open: true });
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const arr = rawList.map(mapOpportunityFromApi).filter(Boolean);
      setList(arr);
    } catch (err) {
      console.error("Error loading opportunities:", err);
      setError(err.message || "Failed to load opportunities");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedIds = useCallback(async () => {
    try {
      const api = await import("../../services/api");
      if (!api.getAccessToken()) return;
      const data = await bookmarks.opportunitiesSavedList();
      const raw = Array.isArray(data) ? data : data?.results || [];
      const ids = new Set(
        raw
          .map((row) => {
            const oid =
              row.opportunity_id ??
              (typeof row.opportunity === "number" || typeof row.opportunity === "string"
                ? row.opportunity
                : row.opportunity?.id);
            return oid != null ? String(oid) : null;
          })
          .filter(Boolean)
      );
      setSavedIds(ids);
    } catch (err) {
      console.error("Error loading saved IDs:", err);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    try {
      const api = await import("../../services/api");
      if (!api.getAccessToken()) return;
      const data = await applications.list();
      const raw = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const map = {};
      raw.forEach((app) => {
        const oppId = String(app.opportunity ?? app.opportunity_id ?? app.id);
        if (oppId) map[oppId] = app;
      });
      setAppliedMap(map);
    } catch (err) {
      console.error("Error loading applications:", err);
    }
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
    loadApplications();
  }, [loadOpportunities, loadSavedIds, loadApplications]);

  const filteredList = list.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (item) => {
    try {
      if (savedIds.has(item.id)) {
        await bookmarks.opportunitiesSavedDelete(Number(item.id));
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      } else {
        await bookmarks.opportunitiesSavedCreate({
          opportunity_id: Number(item.id),
        });
        setSavedIds((prev) => new Set([...prev, item.id]));
      }
    } catch (err) {
      console.error("Error saving opportunity:", err);
    }
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

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-2">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3 flex justify-between items-center cursor-pointer"
                onClick={async (e) => {
                  if (e.target.closest('button')) return;
                  // viewing details when clicking card
                  const app = appliedMap[item.id];
                  if (app) {
                    navigate("/apply/" + item.id, {
                      state: {
                        job: item,
                        existingApplication: app,
                        isEdit: true,
                      },
                    });
                  } else {
                    await navigateToVolunteerDetails(navigate, item.id, {
                      fallbackJob: item,
                    });
                  }
                }}
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
                    onClick={() => {
                      const app = appliedMap[item.id];
                      if (app) {
                        navigate("/apply/" + item.id, {
                          state: {
                            job: item,
                            existingApplication: app,
                            isEdit: true,
                          },
                        });
                      } else {
                        navigate("/volunteer-details", { state: { job: item } });
                      }
                    }}
                    className="bg-[#6A00B1] text-white px-4 py-1 rounded"
                  >
                    {appliedMap[item.id] ? "View application" : "Apply"}
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
