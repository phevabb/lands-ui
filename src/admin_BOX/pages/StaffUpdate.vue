<script setup>
import {
  computed,
  onMounted,
  ref
} from "vue";

import {
  useRoute,
  useRouter
} from "vue-router/composables";

import EditProfileForm from "@/admin_BOX/pages/UserProfile/EditProfileForm_update.vue";
import UserCard from "@/admin_BOX/pages/UserProfile/UserCard.vue";

import {
  get_user_details,
  patch_user,
  user_fields
} from "../../services/api";

const route =
  useRoute();

const router =
  useRouter();

const accountId =
  Number(
    route.params.id
  );

const backendErrors =
  ref({});

const successMessage =
  ref("");

const userFields =
  ref([]);

const userData =
  ref({});

const isLoading =
  ref(true);

const isSubmitting =
  ref(false);

const pageError =
  ref("");

const formTitle =
  computed(() => {
    const fullName =
      String(
        userData.value?.fullName ??
        ""
      ).trim();

    const title =
      getTitleDisplayName(
        userData.value
      );

    if (!fullName) {
      return "Staff Update";
    }

    return [
      title,
      fullName
    ]
      .filter(Boolean)
      .join(" ");
  });

onMounted(async () => {
  await loadUpdatePage();
});

async function loadUpdatePage() {
  isLoading.value = true;
  pageError.value = "";
  backendErrors.value = {};

  if (
    !Number.isInteger(accountId) ||
    accountId <= 0
  ) {
    pageError.value =
      "A valid account ID is required.";

    isLoading.value = false;

    return;
  }

  try {
    console.log(
      "Loading Admin user fields"
    );

    const fieldsResponse =
      await user_fields();

    console.log(
      "Admin user-fields response:",
      fieldsResponse.data
    );

    userFields.value =
      Array.isArray(
        fieldsResponse.data
      )
        ? fieldsResponse.data
        : [];

    if (
      userFields.value.length === 0
    ) {
      throw new Error(
        "No user-field metadata was returned."
      );
    }
  } catch (error) {
    console.error(
      "USER FIELDS REQUEST FAILED:",
      {
        url:
          `${error.config?.baseURL ?? ""}` +
          `${error.config?.url ?? ""}`,

        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message
      }
    );

    pageError.value =
      getRequestErrorMessage(
        error,
        "Failed to load user fields."
      );

    isLoading.value = false;

    return;
  }

  try {
    console.log(
      "Loading user details using account ID:",
      accountId
    );

    const userDetailsResponse =
      await get_user_details(
        accountId
      );

    console.log(
      "User-details response:",
      userDetailsResponse.data
    );

    userData.value =
      normalizeUserDetails(
        userDetailsResponse.data
      );
  } catch (error) {
    console.error(
      "USER DETAILS REQUEST FAILED:",
      {
        accountId:
          accountId,

        url:
          `${error.config?.baseURL ?? ""}` +
          `${error.config?.url ?? ""}`,

        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message
      }
    );

    pageError.value =
      getRequestErrorMessage(
        error,
        "Failed to load user details."
      );
  } finally {
    isLoading.value = false;
  }
}

async function handleFormSubmit(
  submittedData
) {
  console.log(
    "Parent received submit-form event"
  );

  console.log(
    "Payload is FormData:",
    submittedData instanceof
      FormData
  );

  if (isSubmitting.value) {
    return;
  }

  backendErrors.value = {};
  successMessage.value = "";

  if (
    !Number.isInteger(accountId) ||
    accountId <= 0
  ) {
    backendErrors.value = {
      general: [
        "A valid account ID is required."
      ]
    };

    return;
  }

  if (
    !(submittedData instanceof
      FormData)
  ) {
    console.error(
      "Invalid update payload:",
      submittedData
    );

    backendErrors.value = {
      general: [
        "The update form produced an invalid payload."
      ]
    };

    return;
  }

  /*
   * Do not use:
   *
   * submittedData.academicQualifications
   *
   * FormData properties are accessed through
   * get(), getAll(), set(), append() and entries().
   */
  normalizeMultipartFields(
    submittedData
  );

  printMultipartPayload(
    submittedData
  );

  isSubmitting.value = true;

  try {
    console.log(
      "Updating account:",
      accountId
    );

    const response =
      await patch_user(
        accountId,
        submittedData
      );

    console.log(
      "User update response:",
      response.data
    );

    successMessage.value =
      "User updated successfully!";

    if (
      response.data &&
      typeof response.data ===
        "object"
    ) {
      userData.value =
        normalizeUserDetails(
          response.data
        );
    }

    setTimeout(() => {
      router.push(
        "/allusers"
      );
    }, 1500);
  } catch (error) {
    console.error(
      "USER UPDATE REQUEST FAILED:",
      {
        accountId:
          accountId,

        url:
          `${error.config?.baseURL ?? ""}` +
          `${error.config?.url ?? ""}`,

        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message
      }
    );

    backendErrors.value =
      transformBackendErrors(
        error
      );
  } finally {
    isSubmitting.value = false;
  }
}

function normalizeMultipartFields(
  payload
) {
  /*
   * Normalize repeated academic qualification
   * values if the field exists.
   *
   * FormData automatically supports repeated
   * values using getAll().
   */
  const possibleFieldNames = [
    "academicQualifications",
    "academic_qualifications"
  ];

  for (
    const fieldName of
    possibleFieldNames
  ) {
    const values =
      payload.getAll(
        fieldName
      );

    if (values.length === 0) {
      continue;
    }

    payload.delete(
      fieldName
    );

    values.forEach(value => {
      const normalizedValue =
        typeof value ===
          "object" &&
        !(value instanceof File)
          ? value.id
          : value;

      if (
        normalizedValue !== null &&
        normalizedValue !== undefined &&
        String(
          normalizedValue
        ).trim()
      ) {
        payload.append(
          fieldName,
          String(
            normalizedValue
          )
        );
      }
    });
  }
}

function printMultipartPayload(
  payload
) {
  console.log(
    "Multipart update payload:"
  );

  for (
    const [
      key,
      value
    ] of payload.entries()
  ) {
    if (
      typeof File !==
        "undefined" &&
      value instanceof File
    ) {
      console.log(
        key,
        {
          fileName:
            value.name,

          fileType:
            value.type,

          fileSize:
            value.size
        }
      );

      continue;
    }

    console.log(
      key,
      value
    );
  }
}

function normalizeUserDetails(
  responseData
) {
  const data =
    responseData &&
    typeof responseData ===
      "object"
      ? responseData
      : {};

  const academicQualifications =
    data.academicQualifications ??
    data.academic_qualifications ??
    (
      data.academicQualification
        ? [
            data.academicQualification
          ]
        : []
    );

  return {
    ...data,

    id:
      data.id ??
      data.accountId ??
      data.account_id ??
      null,

    userId:
      data.userId ??
      data.user_id ??
      "",

    firstName:
      data.firstName ??
      data.first_name ??
      "",

    middleName:
      data.middleName ??
      data.middle_name ??
      "",

    lastName:
      data.lastName ??
      data.last_name ??
      "",

    fullName:
      data.fullName ??
      data.full_name ??
      "",

    phoneNumber:
      data.phoneNumber ??
      data.phone_number ??
      "",

    supervisorName:
      data.supervisorName ??
      data.supervisor_name ??
      "",

    profilePictureUrl:
      data.profilePictureUrl ??
      data.profile_picture_url ??
      data.profilePicture ??
      data.profile_picture ??
      null,

    academicQualifications:
      Array.isArray(
        academicQualifications
      )
        ? academicQualifications.map(
            qualification => {
              return (
                qualification?.id ??
                qualification
              );
            }
          )
        : [],

    /*
     * Compatibility with older frontend field
     * metadata using the snake_case name.
     */
    academic_qualifications:
      Array.isArray(
        academicQualifications
      )
        ? academicQualifications.map(
            qualification => {
              return (
                qualification?.id ??
                qualification
              );
            }
          )
        : []
  };
}

function getTitleDisplayName(
  account
) {
  if (!account) {
    return "";
  }

  if (
    typeof account.title ===
      "string"
  ) {
    return account.title.trim();
  }

  return String(
    account.titleName ??
    account.title?.name ??
    ""
  ).trim();
}

function transformBackendErrors(
  error
) {
  const responseData =
    error.response?.data;

  if (!responseData) {
    if (
      error.message?.includes(
        "Network Error"
      ) ||
      error.code ===
        "ERR_NETWORK"
    ) {
      return {
        general: [
          "Please check your internet connection."
        ]
      };
    }

    return {
      general: [
        error.message ||
        "Failed to update user."
      ]
    };
  }

  if (
    typeof responseData ===
    "string"
  ) {
    return {
      general: [
        responseData
      ]
    };
  }

  if (
    responseData.detail
  ) {
    return {
      general: [
        String(
          responseData.detail
        )
      ]
    };
  }

  const errors = {};

  for (
    const [
      key,
      value
    ] of Object.entries(
      responseData
    )
  ) {
    if (Array.isArray(value)) {
      errors[key] =
        value.map(
          message => {
            return String(
              message
            );
          }
        );
    } else if (
      value &&
      typeof value ===
        "object"
    ) {
      errors[key] = [
        JSON.stringify(
          value
        )
      ];
    } else {
      errors[key] = [
        String(
          value
        )
      ];
    }
  }

  if (
    Object.keys(errors).length ===
    0
  ) {
    errors.general = [
      "Failed to update user."
    ];
  }

  return errors;
}

function getRequestErrorMessage(
  error,
  fallbackMessage
) {
  if (
    error.message?.includes(
      "Network Error"
    ) ||
    error.code ===
      "ERR_NETWORK"
  ) {
    return "Please check your internet connection.";
  }

  if (
    error.response?.status ===
      401
  ) {
    return "Authentication is required.";
  }

  if (
    error.response?.status ===
      403
  ) {
    return (
      error.response?.data?.detail ||
      "Access is denied."
    );
  }

  if (
    error.response?.status ===
      404
  ) {
    return (
      error.response?.data?.detail ||
      "The requested account was not found."
    );
  }

  return (
    error.response?.data?.detail ||
    fallbackMessage
  );
}
</script>

<template>
  <div class="content">
    <div class="md-layout">
      <div
        v-if="isLoading"
        class="
          md-layout-item
          md-medium-size-100
          md-size-100
        "
      >
        <div class="loading-message">
          Loading staff update form...
        </div>
      </div>

      <div
        v-else-if="pageError"
        class="
          md-layout-item
          md-medium-size-100
          md-size-100
        "
      >
        <div class="error-message">
          {{ pageError }}
        </div>
      </div>

      <template v-else>
        <div
          class="
            md-layout-item
            md-medium-size-100
            md-size-66
          "
        >
          <EditProfileForm
  :title="formTitle"
  sub_title="Update Staff data"
  button_name="Update Staff"
  :backformdata="userFields"
  :form-values="userData"
  :backend-errors="backendErrors"
  :success-message="successMessage"
  :submitting="isSubmitting"
  @submit-form="handleFormSubmit"
/>
        </div>

        <div
          class="
            md-layout-item
            md-medium-size-100
            md-size-33
          "
        >
          <UserCard />
        </div>
      </template>
    </div>
  </div>
</template>