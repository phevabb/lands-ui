






import axios from "axios";

// Production API
// const API_BASE_URL =
//   process.env.VUE_APP_API_BASE_URL ||
//   "https://your-production-domain.com/api";

// Local/testing API
const API_BASE_URL =
  "http://127.0.0.1:8888/api";

const api =
  axios.create({
    baseURL: API_BASE_URL,

    headers: {
      Accept: "application/json"
    },

    timeout: 30000
  });

const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/password-reset",
  "/auth/password-reset-confirm"
];

function getStoredToken() {
  return (
    localStorage.getItem(
      "accessToken"
    ) ||
    localStorage.getItem(
      "token"
    ) ||
    localStorage.getItem(
      "access_token"
    ) ||
    ""
  );
}

function isPublicEndpoint(
  requestUrl
) {
  if (!requestUrl) {
    return false;
  }

  const normalizedUrl =
    String(requestUrl)
      .split("?")[0]
      .replace(/\/+$/, "");

  return PUBLIC_ENDPOINTS.some(
    endpoint => {
      return (
        normalizedUrl === endpoint ||
        normalizedUrl.endsWith(
          endpoint
        )
      );
    }
  );
}

function clearAuthentication() {
  localStorage.removeItem(
    "accessToken"
  );

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "tokenType"
  );

  localStorage.removeItem(
    "tokenExpiresAt"
  );

  localStorage.removeItem(
    "authenticatedUser"
  );

  localStorage.removeItem(
    "superAdminUser"
  );

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "user_id"
  );

  localStorage.removeItem(
    "userId"
  );

  localStorage.removeItem(
    "role"
  );

  localStorage.removeItem(
    "region"
  );

  localStorage.removeItem(
    "region_id"
  );

  localStorage.removeItem(
    "regionName"
  );

  localStorage.removeItem(
    "regionId"
  );

  localStorage.removeItem(
    "isSuperuser"
  );
}

api.interceptors.request.use(
  config => {
    const requestIsPublic =
      isPublicEndpoint(
        config.url
      );

    /*
     * Let the browser generate the correct
     * multipart boundary for FormData.
     *
     * Do not manually set:
     * Content-Type: multipart/form-data
     */
    if (
      config.data instanceof FormData
    ) {
      if (config.headers) {
        delete config.headers[
          "Content-Type"
        ];

        delete config.headers[
          "content-type"
        ];
      }
    } else {
      config.headers[
        "Content-Type"
      ] = "application/json";
    }

    if (!requestIsPublic) {
      const token =
        getStoredToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    } else if (
      config.headers &&
      config.headers.Authorization
    ) {
      delete config.headers.Authorization;
    }

    return config;
  },

  error => {
    return Promise.reject(
      error
    );
  }
);

api.interceptors.response.use(
  response => {
    return response;
  },

  error => {
    const status =
      error.response?.status;

    const currentPath =
      window.location.pathname;

    const requestUrl =
      error.config?.url || "";

    const requestWasPublic =
      isPublicEndpoint(
        requestUrl
      );

    /*
     * Do not redirect when login itself returns 401.
     * The login component needs to display the backend
     * error message.
     */
    if (
      status === 401 &&
      !requestWasPublic
    ) {
      clearAuthentication();

      const isSuperAdminPage =
        currentPath.startsWith(
          "/superadmin"
        );

      const loginPath =
        isSuperAdminPage
          ? "/superadmin/login"
          : "/login";

      if (
        currentPath !== loginPath
      ) {
        window.location.href =
          `${loginPath}?redirect=${encodeURIComponent(
            currentPath
          )}`;
      }
    }

    return Promise.reject(
      error
    );
  }
);

export const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

/*
 * Authentication
 */

export function login(
  credentials
) {
  return api.post(
    "/auth/login",
    {
      userId:
        credentials.userId ||
        credentials.user_ID ||
        "",

      password:
        credentials.password ||
        ""
    }
  );
}

export function logout() {
  return api.post(
    "/auth/logout"
  );
}

export function getAuthenticatedUser() {
  return api.get(
    "/auth/me"
  );
}

export function changePassword(
  payload
) {
  return api.post(
    "/auth/change-password",
    {
      currentPassword:
        payload.currentPassword ||
        payload.current_password ||
        "",

      newPassword:
        payload.newPassword ||
        payload.new_password ||
        "",

      confirmPassword:
        payload.confirmPassword ||
        payload.confirm_password ||
        ""
    }
  );
}

export function requestPasswordReset(
  payload
) {
  return api.post(
    "/auth/password-reset",
    {
      userId:
        payload.userId ||
        payload.user_ID ||
        ""
    }
  );
}

export function confirmPasswordReset(
  payload
) {
  return api.post(
    "/auth/password-reset-confirm",
    {
      token:
        payload.token ||
        "",

      newPassword:
        payload.newPassword ||
        payload.new_password ||
        payload.new_password1 ||
        "",

      confirmPassword:
        payload.confirmPassword ||
        payload.confirm_password ||
        payload.new_password2 ||
        ""
    }
  );
}

/*
 * Backward-compatible authentication names.
 *
 * These allow existing components to keep using:
 *
 * changepassword()
 * resetpassword()
 * resetpasswordconfirm()
 */

export const changepassword =
  payload => {
    return changePassword(
      payload
    );
  };

export const resetpassword =
  payload => {
    return requestPasswordReset(
      payload
    );
  };

export const resetpasswordconfirm =
  payload => {
    return confirmPasswordReset(
      payload
    );
  };

/*
 * Media
 */

export function uploadProfilePicture(
  file
) {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
    file.name
  );

  return api.post(
    "/media/profile-picture",
    formData
  );
}

export function deleteProfilePicture(
  publicId
) {
  return api.delete(
    "/media/profile-picture",
    {
      params: {
        publicId
      }
    }
  );
}

/*
 * Manager profiles
 */

export function getManagerProfiles() {
  return api.get(
    "/manager-profiles"
  );
}

export function getManagerProfile(
  managerProfileId
) {
  return api.get(
    `/manager-profiles/${managerProfileId}`
  );
}

export function getManagerProfileByAccount(
  accountId
) {
  return api.get(
    `/manager-profiles/account/${accountId}`
  );
}

export function getManagerProfilesByRegion(
  regionId
) {
  return api.get(
    `/manager-profiles/region/${regionId}`
  );
}

export function createManagerProfile(
  payload
) {
  return api.post(
    "/manager-profiles",
    {
      accountId:
        Number(
          payload.accountId
        ),

      regionId:
        Number(
          payload.regionId
        )
    }
  );
}

export function updateManagerProfile(
  managerProfileId,
  payload
) {
  return api.put(
    `/manager-profiles/${managerProfileId}`,
    {
      accountId:
        Number(
          payload.accountId
        ),

      regionId:
        Number(
          payload.regionId
        )
    }
  );
}

export function deleteManagerProfile(
  managerProfileId
) {
  return api.delete(
    `/manager-profiles/${managerProfileId}`
  );
}

/*
 * Accounts and regions
 */

export function getAccounts(
  params = {}
) {
  return api.get(
    "/accounts",
    {
      params
    }
  );
}

export function getRegions(
  params = {}
) {
  return api.get(
    "/regions",
    {
      params
    }
  );
}

/*
 * Authentication-storage helpers
 */

export function saveAuthentication(
  responseData
) {
  const token =
    responseData?.token || "";

  const user =
    responseData?.user || null;

  if (!token || !user) {
    throw new Error(
      "The authentication response is incomplete."
    );
  }

  localStorage.setItem(
    "accessToken",
    token
  );

  /*
   * Keep this for existing components that still
   * retrieve the token using localStorage.getItem("token").
   */
  localStorage.setItem(
    "token",
    token
  );

  localStorage.setItem(
    "tokenType",
    responseData.tokenType ||
      "Bearer"
  );

  localStorage.setItem(
    "tokenExpiresAt",
    responseData.expiresAt ||
      ""
  );

  localStorage.setItem(
    "authenticatedUser",
    JSON.stringify(user)
  );

  localStorage.setItem(
    "user",
    user.fullName ||
      user.displayName ||
      user.userId ||
      ""
  );

  localStorage.setItem(
    "user_id",
    user.id !== null &&
    user.id !== undefined
      ? String(user.id)
      : ""
  );

  localStorage.setItem(
    "userId",
    user.userId || ""
  );

  localStorage.setItem(
    "role",
    user.role || ""
  );

  localStorage.setItem(
    "isSuperuser",
    String(
      user.isSuperuser === true
    )
  );

  localStorage.setItem(
    "region",
    user.regionName || ""
  );

  localStorage.setItem(
    "regionName",
    user.regionName || ""
  );

  const regionId =
    user.regionId !== null &&
    user.regionId !== undefined
      ? String(user.regionId)
      : "";

  localStorage.setItem(
    "region_id",
    regionId
  );

  localStorage.setItem(
    "regionId",
    regionId
  );

  return user;
}

export function removeAuthentication() {
  clearAuthentication();
}

export function getStoredUser() {
  const serializedUser =
    localStorage.getItem(
      "authenticatedUser"
    );

  if (!serializedUser) {
    return null;
  }

  try {
    return JSON.parse(
      serializedUser
    );
  } catch (error) {
    return null;
  }
}



export function get_user_details (userId) {
  return api.get(`/staff/${userId}`);
}


export function admin_dashboard_summary (params = {}) {
  return api.get("/admin/dashboard-summary", { params });
}

export const pro_stats =
  (params = {}) => {
    return api.get(
      "/admin/pro-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  };
export const directorate_stats =
  (params = {}) => {
    return api.get(
      "/admin/directorate-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  };
  
export const class_stats =
  (params = {}) => {
    return api.get(
      "/admin/class-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  };


  export const management_stats =
  (params = {}) => {
    return api.get(
      "/admin/management-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  };



 export const region_stats =
  (params = {}) => {
    return api.get(
      "/admin/region-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  };

export const senior_stats =
  (params = {}) => {
    return api.get(
      "/admin/senior-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  }; 
export const gender_stats =
  (params = {}) => {
    return api.get(
      "/admin/gender-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  };

  export const leave_stats =
  (params = {}) => {
    return api.get(
      "/admin/leave-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  };


  export const contract_stats =
  (params = {}) => {
    return api.get(
      "/admin/contract-stats",
      {
        params: {
          page:
            params.page ??
            1,

          page_size:
            params.page_size ??
            params.pageSize ??
            10
        }
      }
    );
  };
  


export const age_stats = (params) => api.get("/admin/dashboard-summary", { params });
export const salary_stats = (params) => api.get("/admin/dashboard-summary", { params });



export {
  api,
  API_BASE_URL
};

export default api;