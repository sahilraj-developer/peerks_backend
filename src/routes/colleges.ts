import { Router } from "express";
import {
  getAllCollegesAndUniversities,
  getCollegesByDistrict,
  getCollegesByState,
  getCollegesByStateAndDistrict,
} from "indian-colleges";

const router = Router();

router.get("/", async (req, res) => {
  const search = String(req.query.search || "").trim().toLowerCase();
  const state = String(req.query.state || "").trim();
  const district = String(req.query.district || "").trim();

  let results: any[] = [];

  if (state && district) {
    results = getCollegesByStateAndDistrict(state, district);
  } else if (state) {
    results = getCollegesByState(state);
  } else if (district) {
    results = getCollegesByDistrict(district);
  } else {
    results = getAllCollegesAndUniversities();
  }

  if (search) {
    results = results.filter((item: any) => {
      const name = typeof item === "string" ? item : item.college;
      return String(name || "").toLowerCase().includes(search);
    });
  }

  res.json({ count: results.length, items: results });
});

export default router;
