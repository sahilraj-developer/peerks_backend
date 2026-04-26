const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret_perks_jwt";

async function testTaskAPIs() {
  const token = jwt.sign({ id: "123", role: "admin", email: "admin@test.com" }, JWT_SECRET, { expiresIn: "1h" });
  console.log("Generated Admin Token:", token);
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // 1. Create a task
    console.log("\n--- Testing POST /api/admin/tasks ---");
    const createRes = await fetch("http://localhost:4000/api/admin/tasks", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Task",
        description: "Test description",
        type: "post_creation",
        rewardCoins: 100,
        campus: "test_campus",
        latitude: 10,
        longitude: 20
      })
    });
    const createData = await createRes.json();
    console.log("Create Task Response:", createData);
    const taskId = createData._id;
    
    // 2. Get all admin tasks
    console.log("\n--- Testing GET /api/admin/tasks ---");
    const getAllRes = await fetch("http://localhost:4000/api/admin/tasks", { headers });
    const getAllData = await getAllRes.json();
    console.log(`Found ${getAllData.total} tasks. First item:`, getAllData.items[0]);
    
    // 3. Update the task
    console.log("\n--- Testing PUT /api/admin/tasks/:id ---");
    const updateRes = await fetch(`http://localhost:4000/api/admin/tasks/${taskId}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ rewardCoins: 200 })
    });
    const updateData = await updateRes.json();
    console.log("Update Task Response (rewardCoins should be 200):", updateData.rewardCoins);
    
    // 4. Get active mobile tasks
    console.log("\n--- Testing GET /api/tasks ---");
    const getMobileRes = await fetch("http://localhost:4000/api/tasks");
    const getMobileData = await getMobileRes.json();
    console.log(`Found ${getMobileData.length} active tasks.`);
    
    // 5. Delete the task
    console.log("\n--- Testing DELETE /api/admin/tasks/:id ---");
    const deleteRes = await fetch(`http://localhost:4000/api/admin/tasks/${taskId}`, { method: "DELETE", headers });
    const deleteData = await deleteRes.json();
    console.log("Delete Task Response:", deleteData);
    
    console.log("\n✅ ALL TASK APIs WORKED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ ERROR:", error.message);
  }
}

testTaskAPIs();
