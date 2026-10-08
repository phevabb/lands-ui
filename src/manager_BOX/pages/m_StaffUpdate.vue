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
        userData.value?.full_name ??
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
  isLoading.value =
    true;

  pageError.value =
    "";

  backendErrors.value =
    {};

  if (
    !Number.isInteger(
      accountId
    ) ||
    accountId <= 0
  ) {
    pageError.value =
      "A valid account ID is required.";

    isLoading.value =
      false;

    return;
  }

  /*
   * Load field metadata first.
   *
   * Keeping these calls separate makes it clear which
   * request failed and prevents confusing error messages.
   */
  try {
    console.log(
      "Loading Manager user fields"
    );

    const fieldsResponse =
      await user_fields();

    console.log(
      "Manager user-fields response:",
      fieldsResponse.data
    );

    userFields.value =
      extractUserFields(
        fieldsResponse.data
      );

    if (
      userFields.value.length ===
      0
    ) {
      throw new Error(
        "No user-field metadata was returned."
      );
    }
  } catch (error) {
    console.error(
      "MANAGER USER FIELDS REQUEST FAILED:",
      {
        url:
          `${error.config?.baseURL ?? ""}` +
          `${error.config?.url ?? ""}`,

        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message,

        code:
          error.code
      }
    );

    pageError.value =
      getRequestErrorMessage(
        error,
        "Failed to load user fields."
      );

    isLoading.value =
      false;

    return;
  }

  /*
   * Load the selected account.
   */
  try {
    console.log(
      "Loading Manager user details using account ID:",
      accountId
    );

    const userDetailsResponse =
      await get_user_details(
        accountId
      );

    console.log(
      "Manager user-details response:",
      userDetailsResponse.data
    );

    userData.value =
      normalizeUserDetails(
        userDetailsResponse.data
      );

    console.log(
      "Normalized Manager form values:",
      userData.value
    );
  } catch (error) {
    console.error(
      "MANAGER USER DETAILS REQUEST FAILED:",
      {
        accountId,

        url:
          `${error.config?.baseURL ?? ""}` +
          `${error.config?.url ?? ""}`,

        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message,

        code:
          error.code
      }
    );

    pageError.value =
      getRequestErrorMessage(
        error,
        "Failed to load user details."
      );
  } finally {
    isLoading.value =
      false;
  }
}

function extractUserFields(
  responseData
) {
  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }

  if (
    responseData &&
    Array.isArray(
      responseData.fields
    )
  ) {
    return responseData.fields;
  }

  if (
    responseData &&
    Array.isArray(
      responseData.results
    )
  ) {
    return responseData.results;
  }

  if (
    responseData &&
    Array.isArray(
      responseData.data
    )
  ) {
    return responseData.data;
  }

  return [];
}

async function handleFormSubmit(
  submittedData
) {
  console.log(
    "Manager parent received submit-form event"
  );

  console.log(
    "Payload is FormData:",
    submittedData instanceof
      FormData
  );

  if (
    isSubmitting.value
  ) {
    return;
  }

  backendErrors.value =
    {};

  successMessage.value =
    "";

  if (
    !Number.isInteger(
      accountId
    ) ||
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
    !(
      submittedData instanceof
      FormData
    )
  ) {
    console.error(
      "Invalid Manager update payload:",
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
   * Keep the field names produced by the shared form.
   *
   * The Admin page works with these names, so the Manager
   * page should not convert every field to a different case.
   */
  normalizeMultipartFields(
    submittedData
  );

  printMultipartPayload(
    submittedData
  );

  isSubmitting.value =
    true;

  try {
    console.log(
      "Manager updating account:",
      accountId
    );

    const response =
      await patch_user(
        accountId,
        submittedData
      );

    console.log(
      "Manager user-update response:",
      response.data
    );

    successMessage.value =
      response.data?.message ||
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

    window.setTimeout(
      () => {
        router.push(
          "/manager/allusers"
        );
      },
      1500
    );
  } catch (error) {
    console.error(
      "MANAGER USER UPDATE REQUEST FAILED:",
      {
        accountId,

        url:
          `${error.config?.baseURL ?? ""}` +
          `${error.config?.url ?? ""}`,

        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message,

        code:
          error.code
      }
    );

    backendErrors.value =
      transformBackendErrors(
        error
      );
  } finally {
    isSubmitting.value =
      false;
  }
}

function normalizeMultipartFields(
  payload
) {
  normalizeRepeatedMultipartField(
    payload,
    [
      "academicQualifications",
      "academic_qualifications"
    ]
  );
}

function normalizeRepeatedMultipartField(
  payload,
  possibleFieldNames
) {
  let matchedFieldName =
    null;

  let values =
    [];

  for (
    const fieldName of
    possibleFieldNames
  ) {
    const fieldValues =
      payload.getAll(
        fieldName
      );

    if (
      fieldValues.length >
      0
    ) {
      matchedFieldName =
        fieldName;

      values =
        fieldValues;

      break;
    }
  }

  if (!matchedFieldName) {
    return;
  }

  /*
   * Remove both possible names so the payload does not
   * contain duplicate qualification collections.
   */
  possibleFieldNames.forEach(
    fieldName => {
      payload.delete(
        fieldName
      );
    }
  );

  values.forEach(value => {
    const normalizedValue =
      normalizeMultipartValue(
        value
      );

    if (
      normalizedValue ===
        null ||
      normalizedValue ===
        undefined ||
      String(
        normalizedValue
      ).trim() ===
        ""
    ) {
      return;
    }

    payload.append(
      matchedFieldName,
      String(
        normalizedValue
      )
    );
  });
}

function normalizeMultipartValue(
  value
) {
  if (
    typeof File !==
      "undefined" &&
    value instanceof
      File
  ) {
    return value;
  }

  if (
    value &&
    typeof value ===
      "object"
  ) {
    return (
      value.id ??
      value.value ??
      value.pk ??
      null
    );
  }

  return value;
}

function printMultipartPayload(
  payload
) {
  console.log(
    "Manager multipart update payload:"
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
      value instanceof
        File
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
        : data.academic_qualification
          ? [
              data.academic_qualification
            ]
          : []
    );

  const normalizedQualificationIds =
    Array.isArray(
      academicQualifications
    )
      ? academicQualifications
          .map(
            qualification => {
              if (
                qualification &&
                typeof qualification ===
                  "object"
              ) {
                return (
                  qualification.id ??
                  qualification.value ??
                  qualification.pk ??
                  null
                );
              }

              return qualification;
            }
          )
          .filter(
            qualificationId => {
              return (
                qualificationId !==
                  null &&
                qualificationId !==
                  undefined &&
                qualificationId !==
                  ""
              );
            }
          )
      : [];

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

    maidenName:
      data.maidenName ??
      data.maiden_name ??
      "",

    fullName:
      data.fullName ??
      data.full_name ??
      data.displayName ??
      data.display_name ??
      "",

    displayName:
      data.displayName ??
      data.display_name ??
      data.fullName ??
      data.full_name ??
      data.userId ??
      data.user_id ??
      "",

    email:
      data.email ??
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

    profilePicture:
      data.profilePicture ??
      data.profile_picture ??
      data.profilePictureUrl ??
      data.profile_picture_url ??
      null,

    title:
      normalizeForeignKeyValue(
        data.titleId,
        data.title_id,
        data.title
      ),

    titleId:
      normalizeForeignKeyValue(
        data.titleId,
        data.title_id,
        data.title
      ),

    titleName:
      data.titleName ??
      data.title_name ??
      getObjectName(
        data.title
      ) ??
      "",

    region:
      normalizeForeignKeyValue(
        data.regionId,
        data.region_id,
        data.region
      ),

    regionId:
      normalizeForeignKeyValue(
        data.regionId,
        data.region_id,
        data.region
      ),

    regionName:
      data.regionName ??
      data.region_name ??
      getObjectName(
        data.region
      ) ??
      "",

    district:
      normalizeForeignKeyValue(
        data.districtId,
        data.district_id,
        data.district
      ),

    districtId:
      normalizeForeignKeyValue(
        data.districtId,
        data.district_id,
        data.district
      ),

    districtName:
      data.districtName ??
      data.district_name ??
      getObjectName(
        data.district
      ) ??
      "",

    directorate:
      normalizeForeignKeyValue(
        data.directorateId,
        data.directorate_id,
        data.directorate
      ),

    directorateId:
      normalizeForeignKeyValue(
        data.directorateId,
        data.directorate_id,
        data.directorate
      ),

    directorateName:
      data.directorateName ??
      data.directorate_name ??
      getObjectName(
        data.directorate
      ) ??
      "",

    category:
      normalizeForeignKeyValue(
        data.categoryId,
        data.category_id,
        data.category
      ),

    categoryId:
      normalizeForeignKeyValue(
        data.categoryId,
        data.category_id,
        data.category
      ),

    categoryName:
      data.categoryName ??
      data.category_name ??
      getObjectName(
        data.category
      ) ??
      "",

    currentGrade:
      normalizeForeignKeyValue(
        data.currentGradeId,
        data.current_grade_id,
        data.currentGrade,
        data.current_grade
      ),

    currentGradeId:
      normalizeForeignKeyValue(
        data.currentGradeId,
        data.current_grade_id,
        data.currentGrade,
        data.current_grade
      ),

    currentGradeName:
      data.currentGradeName ??
      data.current_grade_name ??
      getObjectName(
        data.currentGrade
      ) ??
      getObjectName(
        data.current_grade
      ) ??
      "",

    nextGrade:
      normalizeForeignKeyValue(
        data.nextGradeId,
        data.next_grade_id,
        data.nextGrade,
        data.next_grade
      ),

    nextGradeId:
      normalizeForeignKeyValue(
        data.nextGradeId,
        data.next_grade_id,
        data.nextGrade,
        data.next_grade
      ),

    nextGradeName:
      data.nextGradeName ??
      data.next_grade_name ??
      getObjectName(
        data.nextGrade
      ) ??
      getObjectName(
        data.next_grade
      ) ??
      "",

    changeOfGrade:
      normalizeForeignKeyValue(
        data.changeOfGradeId,
        data.change_of_grade_id,
        data.changeOfGrade,
        data.change_of_grade
      ),

    changeOfGradeId:
      normalizeForeignKeyValue(
        data.changeOfGradeId,
        data.change_of_grade_id,
        data.changeOfGrade,
        data.change_of_grade
      ),

    changeOfGradeName:
      data.changeOfGradeName ??
      data.change_of_grade_name ??
      getObjectName(
        data.changeOfGrade
      ) ??
      getObjectName(
        data.change_of_grade
      ) ??
      "",

    managementUnitCostCentre:
      normalizeForeignKeyValue(
        data.managementUnitCostCentreId,
        data.management_unit_cost_centre_id,
        data.managementUnitCostCentre,
        data.management_unit_cost_centre
      ),

    managementUnitCostCentreId:
      normalizeForeignKeyValue(
        data.managementUnitCostCentreId,
        data.management_unit_cost_centre_id,
        data.managementUnitCostCentre,
        data.management_unit_cost_centre
      ),

    managementUnitCostCentreName:
      data.managementUnitCostCentreName ??
      data.management_unit_cost_centre_name ??
      getObjectName(
        data.managementUnitCostCentre
      ) ??
      getObjectName(
        data.management_unit_cost_centre
      ) ??
      "",

    onLeaveType:
      normalizeForeignKeyValue(
        data.onLeaveTypeId,
        data.on_leave_type_id,
        data.onLeaveType,
        data.on_leave_type
      ),

    onLeaveTypeId:
      normalizeForeignKeyValue(
        data.onLeaveTypeId,
        data.on_leave_type_id,
        data.onLeaveType,
        data.on_leave_type
      ),

    onLeaveTypeName:
      data.onLeaveTypeName ??
      data.on_leave_type_name ??
      getObjectName(
        data.onLeaveType
      ) ??
      getObjectName(
        data.on_leave_type
      ) ??
      "",

    academicQualification:
      normalizeForeignKeyValue(
        data.academicQualificationId,
        data.academic_qualification_id,
        data.academicQualification,
        data.academic_qualification
      ),

    academicQualificationId:
      normalizeForeignKeyValue(
        data.academicQualificationId,
        data.academic_qualification_id,
        data.academicQualification,
        data.academic_qualification
      ),

    academicQualifications:
      normalizedQualificationIds,

    academic_qualifications:
      normalizedQualificationIds
  };
}

function normalizeForeignKeyValue(
  ...values
) {
  for (
    const value of
    values
  ) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    if (
      value &&
      typeof value ===
        "object" &&
      !Array.isArray(value)
    ) {
      const objectId =
        value.id ??
        value.value ??
        value.pk;

      if (
        objectId !== null &&
        objectId !== undefined &&
        objectId !== ""
      ) {
        return objectId;
      }

      continue;
    }

    return value;
  }

  return "";
}

function getObjectName(
  value
) {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return "";
  }

  return String(
    value.name ??
    value.label ??
    value.title ??
    ""
  ).trim();
}

function getTitleDisplayName(
  account
) {
  if (!account) {
    return "";
  }

  /*
   * Do not display a numeric foreign-key ID as the title.
   */
  if (
    typeof account.title ===
      "string" &&
    account.title.trim() &&
    Number.isNaN(
      Number(
        account.title
      )
    )
  ) {
    return account.title
      .trim();
  }

  return String(
    account.titleName ??
    account.title_name ??
    getObjectName(
      account.title
    ) ??
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
      error.code ===
        "ECONNABORTED" ||
      error.message
        ?.toLowerCase()
        .includes(
          "timeout"
        )
    ) {
      return {
        general: [
          "The update request took too long."
        ]
      };
    }

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

  const generalMessage =
    responseData.detail ||
    responseData.message ||
    responseData.error;

  if (generalMessage) {
    return {
      general: [
        String(
          generalMessage
        )
      ]
    };
  }

  const errors =
    {};

  for (
    const [
      key,
      value
    ] of Object.entries(
      responseData
    )
  ) {
    if (
      Array.isArray(value)
    ) {
      errors[key] =
        value.map(
          message => {
            return String(
              message
            );
          }
        );

      continue;
    }

    if (
      value &&
      typeof value ===
        "object"
    ) {
      errors[key] = [
        JSON.stringify(
          value
        )
      ];

      continue;
    }

    errors[key] = [
      String(
        value
      )
    ];
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
    error.code ===
      "ECONNABORTED" ||
    error.message
      ?.toLowerCase()
      .includes(
        "timeout"
      )
  ) {
    return "The server took too long to respond.";
  }

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
      "Manager access is required."
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
    error.response?.data?.message ||
    error.response?.data?.error ||
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

          <button
            type="button"
            class="retry-button"
            @click="loadUpdatePage"
          >
            Try Again
          </button>
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

<style scoped>
.loading-message {
  margin: 24px 0;
  color: #475569;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: #dc2626;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

.retry-button {
  padding: 9px 16px;
  color: #ffffff;
  font-weight: 700;
  border: 0;
  border-radius: 8px;
  background: #4338ca;
  cursor: pointer;
}
</style>