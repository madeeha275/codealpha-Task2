// test_api.js
const axios = require('axios');
const base = 'http://localhost:5001/api';
(async () => {
  try {
    // Register (ignore errors if already exists)
    await axios.post(`${base}/auth/register`, {
      name: 'TestUser',
      email: 'testuser@example.com',
      password: 'Password123'
    }).catch(() => {});
    // Login
    const loginRes = await axios.post(`${base}/auth/login`, {
      email: 'testuser@example.com',
      password: 'Password123'
    });
    const token = loginRes.data.token;
    console.log('TOKEN', token);
    const authHeader = { Authorization: `Bearer ${token}` };
    // Get projects (should be empty)
    const projList = await axios.get(`${base}/projects`, { headers: authHeader });
    console.log('PROJECTS', projList.data);
    // Create project
    const newProj = await axios.post(`${base}/projects`, {
      name: 'Demo Project',
      description: 'Demo',
      color: '#ff0000'
    }, { headers: authHeader });
    console.log('NEWPROJECT', newProj.data);
    const projId = newProj.data._id || newProj.data.id;
    // Get project details
    const projDetail = await axios.get(`${base}/projects/${projId}`, { headers: authHeader });
    console.log('PROJECTDETAIL', projDetail.data);
    const columnId = projDetail.data.columns[0]._id;
    // Create task
    const newTask = await axios.post(`${base}/projects/${projId}/tasks`, {
      title: 'Task 1',
      columnId
    }, { headers: authHeader });
    console.log('NEWTASK', newTask.data);
    const taskId = newTask.data._id || newTask.data.id;
    // Get tasks for project
    const tasks = await axios.get(`${base}/projects/${projId}/tasks`, { headers: authHeader });
    console.log('PROJECTTASKS', tasks.data);
    // Update task
    const updated = await axios.put(`${base}/tasks/${taskId}`, { title: 'Task 1 Updated' }, { headers: authHeader });
    console.log('UPDATEDTASK', updated.data);
    // Move task
    const moved = await axios.patch(`${base}/tasks/${taskId}/move`, { columnId, newOrder: 1 }, { headers: authHeader });
    console.log('MOVEDTASK', moved.data);
    // Delete task
    const del = await axios.delete(`${base}/tasks/${taskId}`, { headers: authHeader });
    console.log('DELETED', del.data);
  } catch (e) {
    console.error('ERROR', e.response ? e.response.data : e.message);
  }
})();
