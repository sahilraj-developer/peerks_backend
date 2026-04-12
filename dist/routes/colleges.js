"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const indian_colleges_1 = require("indian-colleges");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const search = String(req.query.search || "").trim().toLowerCase();
    const state = String(req.query.state || "").trim();
    const district = String(req.query.district || "").trim();
    let results = [];
    if (state && district) {
        results = (0, indian_colleges_1.getCollegesByStateAndDistrict)(state, district);
    }
    else if (state) {
        results = (0, indian_colleges_1.getCollegesByState)(state);
    }
    else if (district) {
        results = (0, indian_colleges_1.getCollegesByDistrict)(district);
    }
    else {
        results = (0, indian_colleges_1.getAllCollegesAndUniversities)();
    }
    if (search) {
        results = results.filter((item) => {
            const name = typeof item === "string" ? item : item.college;
            return String(name || "").toLowerCase().includes(search);
        });
    }
    res.json({ count: results.length, items: results });
});
exports.default = router;
//# sourceMappingURL=colleges.js.map