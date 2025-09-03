// services/api.js
import axios from 'axios';


const api = axios.create({
  // http://127.0.0.1:8000/
  // 'https://phevab1.pythonanywhere.com/
  baseURL: 'https://phevab1.pythonanywhere.com/', //or your base URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Enable token header
api.interceptors.request.use((config) => {
  const publicEndpoints = ['api/v1/auth/login', 'api/v1/auth/password-reset/confirm', ];
  const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));

  if (!isPublic) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }

  return config;
});

// AUTHS
export const login = (credentials) => api.post('api/v1/auth/login', credentials);
export const logout = () => api.post('api/v1/auth/logout');
export const changepassword = (data) => api.post('api/v1/auth/change-password', data);
export const resetpassword = (data) => api.post('api/v1/auth/password-reset', data);
export const resetpasswordconfirm = (data) => api.post('api/v1/auth/password-reset/confirm', data);


// SUPERADMIN
// directorate stats
export const directorate_stats = () =>  api.get("superadmin/api/v1/directorate-stats");
export const class_stats = () =>  api.get("superadmin/api/v1/class-stats");
export const region_stats = () =>  api.get("superadmin/api/v1/region-stats");
export const management_stats = () =>  api.get("superadmin/api/v1/management-stats");
export const senior_stats = () =>  api.get("superadmin/api/v1/senior-stats");
export const gender_stats = () =>  api.get("superadmin/api/v1/gender-stats");
export const age_stats = () =>  api.get("superadmin/api/v1/age-stats");
export const salary_stats = () =>  api.get("superadmin/api/v1/salary-grade-stats");
export const leave_stats = () =>  api.get("superadmin/api/v1/leave-stats");
export const contract_stats = () =>  api.get("superadmin/api/v1/contract-stats");
export const pro_stats = () =>  api.get("superadmin/api/v1/pro-stats");
export const admin_dashboard_summary = () =>  api.get("superadmin/api/v1/admin-dashboard-summary");
export const all_users = (params) => api.get("superadmin/api/v1/all-users", { params });
// api.js
export const create_user = (payload) => api.post("superadmin/api/v1/users/create", payload);
export const user_fields = () => api.get("superadmin/api/v1/user-fields");
// Fetch user details by ID
export const get_user_details = (userId) =>api.get(`superadmin/api/v1/users/${userId}`);
export const update_user = (userId) =>api.get(`superadmin/api/v1/user-update/${userId}`);

// PUT (full update)
export const patch_user = (userId, payload) =>
  api.put(`superadmin/api/v1/user-update/${userId}`, payload);

// PATCH (partial update)
export const put_user = (userId, payload) =>
  api.patch(`superadmin/api/v1/user-update/${userId}`, payload);


export const all_users_to_excel = () => api.get("superadmin/api/v1/all-users-to-excel");


export const users_per_department = (dept) => {return api.get(`superadmin/api/v1/users-per-department/?dept=${encodeURIComponent(dept)}`)
}
























export default api;
