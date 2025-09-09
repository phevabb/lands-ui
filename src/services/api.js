import axios from 'axios';

// https://phevab1.pythonanywhere.com/
// http://127.0.0.1:8000/

   const api = axios.create({
     baseURL: 'https://phevab1.pythonanywhere.com/',
   });

   api.interceptors.request.use(
     (config) => {

       if (config.data instanceof FormData) {
         for (let [key, value] of config.data.entries()) {

         }
         // Ensure Content-Type is unset for FormData
         config.headers['Content-Type'] = 'multipart/form-data';
       }
       const publicEndpoints = [
         'api/v1/auth/login',
         'api/v1/auth/password-reset/confirm'
       ];
       const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));
       if (!isPublic) {
         const token = localStorage.getItem('token');
         if (token) {
           config.headers.Authorization = `Token ${token}`;
         }
       }
       return config;
     },
     (error) => {

       return Promise.reject(error);
     }
   );

   export const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

   // AUTHS
   export const login = (credentials) => api.post('api/v1/auth/login', credentials);
   export const logout = () => api.post('api/v1/auth/logout');
   export const changepassword = (data) => api.post('api/v1/auth/change-password', data);
   export const resetpassword = (data) => api.post('api/v1/auth/password-reset', data);
   export const resetpasswordconfirm = (data) => api.post('api/v1/auth/password-reset/confirm', data);

   // SUPERADMIN
   export const directorate_stats = (params) => api.get("superadmin/api/v1/directorate-stats", { params });
   export const class_stats = (params) => api.get("superadmin/api/v1/class-stats", { params });
   export const region_stats = (params) => api.get("superadmin/api/v1/region-stats", { params });
   export const management_stats = (params) => api.get("superadmin/api/v1/management-stats", { params });
   export const senior_stats = (params) => api.get("superadmin/api/v1/senior-stats", { params });
   export const gender_stats = (params) => api.get("superadmin/api/v1/gender-stats", { params });
   export const age_stats = (params) => api.get("superadmin/api/v1/age-stats", { params });
   export const salary_stats = (params) => api.get("superadmin/api/v1/salary-grade-stats", { params });
   export const leave_stats = (params) => api.get("superadmin/api/v1/leave-stats", { params });
   export const contract_stats = (params) => api.get("superadmin/api/v1/contract-stats", { params });
   export const pro_stats = (params) => api.get("superadmin/api/v1/pro-stats", { params });
   export const admin_dashboard_summary = () => api.get("superadmin/api/v1/admin-dashboard-summary");
   export const all_users = (params) => api.get("superadmin/api/v1/all-users", { params });

   // Users
   export const create_user = (payload) => api.post("superadmin/api/v1/users/create", payload);
   export const user_fields = () => api.get("superadmin/api/v1/user-fields");
   export const get_user_details = (userId) => api.get(`superadmin/api/v1/users/${userId}`);
   export const update_user = (userId) => api.get(`superadmin/api/v1/user-update/${userId}/`);
   export const put_user = (userId, payload) => {

     for (let [key, value] of payload.entries()) {

     }
     return api.put(`superadmin/api/v1/user-update/${userId}/`, payload);
   };
   export const patch_user = (userId, payload) => {

     for (let [key, value] of payload.entries()) {

     }
     return api.patch(`superadmin/api/v1/user-update/${userId}/`, payload);
   };
   export const all_users_to_excel = () => api.get("superadmin/api/v1/all-users-to-excel");
   export const users_per_department = (dept, params = {}) => {
     return api.get("superadmin/api/v1/users-per-department/", {
       params: { dept, ...params },
     });
   };

   export default api;
   