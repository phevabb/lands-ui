<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref
} from "vue";

import {
  useRouter
} from "vue-router/composables";

import Swal from "sweetalert2";

import {
  create_user_new,
  DEFAULT_AVATAR,
  user_fields
} from "@/services/api";

const router =
  useRouter();

const loading =
  ref(true);

const submitting =
  ref(false);

const loadError =
  ref("");

const backendErrors =
  ref({});

const userFields =
  ref([]);

const formData =
  reactive({});

const fileInput =
  ref(null);

const profilePictureFile =
  ref(null);

const profilePicturePreview =
  ref(DEFAULT_AVATAR);

const maximumProfilePictureSize =
  5 * 1024 * 1024;

const allowedImageTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
  ]);

const personalInfoFields =
  computed(() => {
    return getFieldsByNames([
      "user_id",
      "role",
      "first_name",
      "middle_name",
      "last_name",
      "maiden_name",
      "email",
      "phone_number",
      "gender",
      "date_of_birth",
      "marital_status",
      "title_id"
    ]);
  });

const organizationFields =
  computed(() => {
    return getFieldsByNames([
      "academic_qualification_id",
      "directorate_id",
      "category_id",
      "district_id",
      "region_id",
      "current_grade_id",
      "next_grade_id",
      "change_of_grade_id",
      "management_unit_cost_centre_id",
      "on_leave_type_id"
    ]);
  });

const employmentFields =
  computed(() => {
    return getFieldsByNames([
      "professional",
      "professional_qualification",
      "staff_category",
      "fulltime_contract_staff",
      "at_post_on_leave",
      "supervisor_name"
    ]);
  });

const employmentDateFields =
  computed(() => {
    return getFieldsByNames([
      "date_of_assumption_of_duty",
      "substantive_date",
      "national_effective_date",
      "date_of_last_promotion",
      "date_of_first_appointment"
    ]);
  });

const financialFields =
  computed(() => {
    return getFieldsByNames([
      "current_salary_level",
      "current_salary_point",
      "next_salary_level",
      "single_spine_monthly_salary",
      "monthly_gross_pay",
      "annual_salary",
      "payroll_status"
    ]);
  });

const identificationFields =
  computed(() => {
    return getFieldsByNames([
      "ghana_card_number",
      "social_security_number",
      "national_health_insurance_number",
      "bank_name",
      "bank_account_number",
      "bank_account_branch",
      "accommodation_status"
    ]);
  });

const performanceFields =
  computed(() => {
    return getFieldsByNames([
      "number_of_focus_areas",
      "number_of_targets",
      "number_of_targets_met",
      "number_of_targets_not_met",
      "overall_assessment_score",
      "self_assessment_description"
    ]);
  });

const profilePictureField =
  computed(() => {
    return userFields.value.find(
      field => {
        return (
          normalizeFieldName(
            field.field_name
          ) ===
          "profile_picture_url"
        );
      }
    );
  });

const otherFields =
  computed(() => {
    const groupedNames =
      new Set(
        [
          ...personalInfoFields.value,
          ...organizationFields.value,
          ...employmentFields.value,
          ...employmentDateFields.value,
          ...financialFields.value,
          ...identificationFields.value,
          ...performanceFields.value
        ].map(field => {
          return field.field_name;
        })
      );

    return userFields.value.filter(
      field => {
        const normalizedName =
          normalizeFieldName(
            field.field_name
          );

        return (
          !groupedNames.has(
            field.field_name
          ) &&
          normalizedName !==
            "profile_picture_url" &&
          normalizedName !==
            "profile_picture_public_id" &&
          normalizedName !==
            "password_hash" &&
          normalizedName !==
            "id"
        );
      }
    );
  });

onMounted(async () => {
  await loadUserFields();
});

onBeforeUnmount(() => {
  revokeTemporaryPreview();
});

async function loadUserFields() {
  loading.value = true;
  loadError.value = "";
  backendErrors.value = {};

  try {
    console.log(
      "Loading new-person fields"
    );

    const response =
      await user_fields();

    userFields.value =
      Array.isArray(
        response.data
      )
        ? response.data
        : [];

    if (
      userFields.value.length === 0
    ) {
      loadError.value =
        "No user fields were returned.";

      return;
    }

    initializeFormData();

    console.log(
      "New-person fields loaded:",
      userFields.value.length
    );
  } catch (error) {
    console.error(
      "Unable to load new-person fields:",
      {
        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message
      }
    );

    loadError.value =
      error.response?.data?.detail ||
      "The new-person form could not be loaded.";
  } finally {
    loading.value = false;
  }
}

function initializeFormData() {
  userFields.value.forEach(
    field => {
      const fieldName =
        field.field_name;

      if (!fieldName) {
        return;
      }

      const normalizedName =
        normalizeFieldName(
          fieldName
        );

      if (
        field.field_type ===
        "ManyToManyField"
      ) {
        formData[fieldName] = [];

        return;
      }

      if (
        normalizedName ===
        "profile_picture_url"
      ) {
        formData[fieldName] = null;

        return;
      }

      if (
        normalizedName ===
        "standard_retirement_age"
      ) {
        formData[fieldName] = 60;

        return;
      }

      if (
        field.field_type ===
        "BooleanField"
      ) {
        formData[fieldName] =
          getDefaultBooleanValue(
            normalizedName
          );

        return;
      }

      formData[fieldName] = "";
    }
  );
}

function getDefaultBooleanValue(
  normalizedName
) {
  if (
    normalizedName ===
    "is_active"
  ) {
    return true;
  }

  return false;
}

function normalizeFieldName(
  fieldName
) {
  return String(
    fieldName ?? ""
  )
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1_$2"
    )
    .replace(
      /[\s-]+/g,
      "_"
    )
    .toLowerCase();
}

function getFieldsByNames(
  fieldNames
) {
  const acceptedNames =
    new Set(
      fieldNames
    );

  return userFields.value.filter(
    field => {
      return acceptedNames.has(
        normalizeFieldName(
          field.field_name
        )
      );
    }
  );
}

function getOptions(
  field
) {
  if (
    Array.isArray(
      field.items
    )
  ) {
    return field.items;
  }

  if (
    Array.isArray(
      field.choices
    )
  ) {
    return field.choices;
  }

  return [];
}

function getOptionValue(
  option
) {
  if (Array.isArray(option)) {
    return option[0];
  }

  return (
    option?.id ??
    option?.value ??
    ""
  );
}

function getOptionLabel(
  option
) {
  if (Array.isArray(option)) {
    return option[1];
  }

  return (
    option?.name ??
    option?.label ??
    option?.value ??
    ""
  );
}

function isSelectField(
  field
) {
  return (
    (
      field.field_type ===
        "ForeignKey" &&
      getOptions(field).length >
        0
    ) ||
    (
      (
        field.field_type ===
          "ChoiceField" ||
        field.field_type ===
          "CharField"
      ) &&
      getOptions(field).length >
        0
    )
  );
}

function isManyToManyField(
  field
) {
  return (
    field.field_type ===
    "ManyToManyField"
  );
}

function isBooleanField(
  field
) {
  return (
    field.field_type ===
    "BooleanField"
  );
}

function isTextAreaField(
  field
) {
  return (
    field.field_type ===
      "TextField" ||
    normalizeFieldName(
      field.field_name
    ) ===
      "self_assessment_description"
  );
}

function getInputType(
  field
) {
  switch (
    field.field_type
  ) {
    case "DateField":
      return "date";

    case "IntegerField":
      return "number";

    case "DecimalField":
      return "number";

    case "EmailField":
      return "email";

    case "URLField":
      return "url";

    default:
      return "text";
  }
}

function getInputStep(
  field
) {
  if (
    field.field_type ===
    "DecimalField"
  ) {
    return "0.01";
  }

  if (
    field.field_type ===
    "IntegerField"
  ) {
    return "1";
  }

  return undefined;
}

function formatLabel(
  fieldName
) {
  const normalizedName =
    normalizeFieldName(
      fieldName
    );

  const customLabels = {
    user_id:
      "STAFF ID",

    academic_qualification_id:
      "ACADEMIC QUALIFICATION",

    directorate_id:
      "DIRECTORATE",

    category_id:
      "STAFF CLASS",

    district_id:
      "DISTRICT",

    region_id:
      "REGION",

    current_grade_id:
      "CURRENT GRADE",

    next_grade_id:
      "NEXT GRADE",

    change_of_grade_id:
      "CHANGE OF GRADE",

    management_unit_cost_centre_id:
      "MANAGEMENT UNIT",

    title_id:
      "TITLE",

    on_leave_type_id:
      "LEAVE TYPE",

    fulltime_contract_staff:
      "EMPLOYMENT TYPE",

    at_post_on_leave:
      "POST OR LEAVE STATUS",

    national_health_insurance_number:
      "NHIS NUMBER",

    social_security_number:
      "SSNIT NUMBER"
  };

  if (
    customLabels[
      normalizedName
    ]
  ) {
    return customLabels[
      normalizedName
    ];
  }

  return normalizedName
    .replace(
      /_id$/,
      ""
    )
    .replace(
      /_/g,
      " "
    )
    .toUpperCase();
}

function isRequiredField(
  field
) {
  return field.required ===
    true;
}

function backendErrorFor(
  fieldName
) {
  const camelCaseError =
    backendErrors.value[
      fieldName
    ];

  if (camelCaseError) {
    return normalizeMessages(
      camelCaseError
    );
  }

  const normalizedName =
    normalizeFieldName(
      fieldName
    );

  const matchingKey =
    Object.keys(
      backendErrors.value
    ).find(key => {
      return (
        normalizeFieldName(key) ===
        normalizedName
      );
    });

  if (!matchingKey) {
    return [];
  }

  return normalizeMessages(
    backendErrors.value[
      matchingKey
    ]
  );
}

function normalizeMessages(
  messages
) {
  if (Array.isArray(messages)) {
    return messages.map(String);
  }

  if (
    messages === null ||
    messages === undefined
  ) {
    return [];
  }

  return [
    String(messages)
  ];
}

function onFileChange(
  file
) {
  if (!file) {
    clearFile();

    return;
  }

  if (
    !allowedImageTypes.has(
      file.type
    )
  ) {
    Swal.fire({
      icon: "error",
      title: "Invalid Image",
      text:
        "Select a JPG, JPEG, PNG, or WEBP image."
    });

    clearFile();

    return;
  }

  if (
    file.size >
    maximumProfilePictureSize
  ) {
    Swal.fire({
      icon: "error",
      title: "Image Too Large",
      text:
        "The profile picture must not exceed 5 MB."
    });

    clearFile();

    return;
  }

  revokeTemporaryPreview();

  profilePictureFile.value =
    file;

  profilePicturePreview.value =
    URL.createObjectURL(
      file
    );

  if (
    profilePictureField.value
      ?.field_name
  ) {
    formData[
      profilePictureField.value
        .field_name
    ] =
      file;
  }
}

function clearFile() {
  revokeTemporaryPreview();

  profilePictureFile.value =
    null;

  profilePicturePreview.value =
    DEFAULT_AVATAR;

  if (
    profilePictureField.value
      ?.field_name
  ) {
    formData[
      profilePictureField.value
        .field_name
    ] =
      null;
  }

  if (fileInput.value) {
    fileInput.value.value =
      "";
  }
}

function revokeTemporaryPreview() {
  if (
    typeof profilePicturePreview.value ===
      "string" &&
    profilePicturePreview.value.startsWith(
      "blob:"
    )
  ) {
    URL.revokeObjectURL(
      profilePicturePreview.value
    );
  }
}

function handleProfilePictureError(
  event
) {
  const image =
    event.target;

  if (
    image.dataset
      .fallbackApplied ===
    "true"
  ) {
    return;
  }

  image.dataset
    .fallbackApplied =
    "true";

  image.src =
    DEFAULT_AVATAR;
}

async function handleSubmit() {
  if (submitting.value) {
    return;
  }

  backendErrors.value = {};

  const clientErrors =
    validateForm();

  if (
    Object.keys(clientErrors).length >
    0
  ) {
    backendErrors.value =
      clientErrors;

    const firstMessage =
      Object.values(
        clientErrors
      )[0]?.[0];

    await Swal.fire({
      icon: "error",
      title: "Check the Form",
      text:
        firstMessage ||
        "Complete the required fields."
    });

    return;
  }

  const requestData =
    buildMultipartPayload();

  submitting.value = true;

  try {
    console.log(
      "Submitting new-person form"
    );

    for (
      const [
        key,
        value
      ] of requestData.entries()
    ) {
      if (
        value instanceof File
      ) {
        console.log(
          key,
          {
            name:
              value.name,

            type:
              value.type,

            size:
              value.size
          }
        );
      } else {
        console.log(
          key,
          value
        );
      }
    }

    const response =
      await create_user_new(
        requestData
      );

    console.log(
      "New user created:",
      response.data
    );

    await Swal.fire({
      icon: "success",
      title: "User Created",
      text:
        "The user account was created successfully.",
      timer: 2000,
      showConfirmButton: false
    });

    resetForm();

    setTimeout(() => {
      router.push(
        "/manager/allusers"
      );
    }, 300);
  } catch (error) {
    console.error(
      "Unable to create user:",
      {
        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message
      }
    );

    backendErrors.value =
      normalizeBackendErrors(
        error
      );

    const firstMessage =
      Object.values(
        backendErrors.value
      )[0]?.[0];

    await Swal.fire({
      icon: "error",
      title: "Unable to Create User",
      text:
        firstMessage ||
        "The user account could not be created."
    });
  } finally {
    submitting.value = false;
  }
}

function buildMultipartPayload() {
  const requestData =
    new FormData();

  for (
    const [
      fieldName,
      value
    ] of Object.entries(
      formData
    )
  ) {
    if (
      normalizeFieldName(
        fieldName
      ) ===
      "profile_picture_url"
    ) {
      continue;
    }

    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        const normalizedValue =
          item &&
          typeof item ===
            "object"
            ? (
                item.id ??
                item.value
              )
            : item;

        if (
          normalizedValue !== null &&
          normalizedValue !== undefined &&
          String(
            normalizedValue
          ).trim() !== ""
        ) {
          requestData.append(
            fieldName,
            String(
              normalizedValue
            )
          );
        }
      });

      continue;
    }

    requestData.append(
      fieldName,
      String(value)
    );
  }

  if (
    profilePictureFile.value instanceof
    File
  ) {
    requestData.append(
      profilePictureField.value
        ?.field_name ||
        "profilePictureUrl",
      profilePictureFile.value,
      profilePictureFile.value.name
    );
  }

  return requestData;
}

function validateForm() {
  const errors = {};

  userFields.value.forEach(
    field => {
      if (
        !isRequiredField(field)
      ) {
        return;
      }

      const value =
        formData[
          field.field_name
        ];

      const isEmptyArray =
        Array.isArray(value) &&
        value.length === 0;

      const isEmptyValue =
        value === null ||
        value === undefined ||
        (
          typeof value ===
            "string" &&
          value.trim() ===
            ""
        );

      if (
        isEmptyArray ||
        isEmptyValue
      ) {
        errors[
          field.field_name
        ] = [
          `${formatLabel(
            field.field_name
          )} is required.`
        ];
      }
    }
  );

  const userIdKey =
    findFormKey(
      "user_id"
    );

  if (
    userIdKey &&
    !String(
      formData[userIdKey] ?? ""
    ).trim()
  ) {
    errors[userIdKey] = [
      "Staff ID is required."
    ];
  }

  const roleKey =
    findFormKey(
      "role"
    );

  if (
    roleKey &&
    !String(
      formData[roleKey] ?? ""
    ).trim()
  ) {
    errors[roleKey] = [
      "Role is required."
    ];
  }

  const numberOfTargets =
    getNumericFormValue(
      "number_of_targets"
    );

  const targetsMet =
    getNumericFormValue(
      "number_of_targets_met"
    );

  const targetsNotMet =
    getNumericFormValue(
      "number_of_targets_not_met"
    );

  if (
    numberOfTargets !== null &&
    targetsMet !== null &&
    targetsNotMet !== null &&
    targetsMet +
      targetsNotMet >
      numberOfTargets
  ) {
    const targetsKey =
      findFormKey(
        "number_of_targets"
      ) ||
      "numberOfTargets";

    errors[targetsKey] = [
      "Targets met and targets not met cannot exceed the total targets."
    ];
  }

  return errors;
}

function findFormKey(
  normalizedName
) {
  return Object.keys(
    formData
  ).find(key => {
    return (
      normalizeFieldName(key) ===
      normalizedName
    );
  });
}

function getNumericFormValue(
  normalizedName
) {
  const fieldKey =
    findFormKey(
      normalizedName
    );

  if (!fieldKey) {
    return null;
  }

  const rawValue =
    formData[
      fieldKey
    ];

  if (
    rawValue === null ||
    rawValue === undefined ||
    rawValue === ""
  ) {
    return null;
  }

  const numberValue =
    Number(rawValue);

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : null;
}

function normalizeBackendErrors(
  error
) {
  const responseData =
    error.response?.data;

  if (!responseData) {
    return {
      general: [
        error.code ===
          "ERR_NETWORK"
          ? "Please check your internet connection."
          : "The user account could not be created."
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

  Object.entries(
    responseData
  ).forEach(
    ([
      field,
      messages
    ]) => {
      errors[field] =
        normalizeMessages(
          messages
        );
    }
  );

  if (
    Object.keys(errors).length ===
    0
  ) {
    errors.general = [
      "The user account could not be created."
    ];
  }

  return errors;
}

function resetForm() {
  Object.keys(
    formData
  ).forEach(
    fieldName => {
      const field =
        userFields.value.find(
          item => {
            return (
              item.field_name ===
              fieldName
            );
          }
        );

      const normalizedName =
        normalizeFieldName(
          fieldName
        );

      if (
        field?.field_type ===
        "ManyToManyField"
      ) {
        formData[fieldName] = [];

        return;
      }

      if (
        normalizedName ===
        "standard_retirement_age"
      ) {
        formData[fieldName] = 60;

        return;
      }

      if (
        normalizedName ===
        "profile_picture_url"
      ) {
        formData[fieldName] = null;

        return;
      }

      if (
        field?.field_type ===
        "BooleanField"
      ) {
        formData[fieldName] =
          getDefaultBooleanValue(
            normalizedName
          );

        return;
      }

      formData[fieldName] = "";
    }
  );

  backendErrors.value = {};

  clearFile();
}
</script>

<template>
  <div class="new-person-page">
    <div
      v-if="loading"
      class="state-card"
    >
      <span class="large-spinner"></span>

      <h3>
        Loading New User Form
      </h3>

      <p>
        Please wait while the account fields are retrieved.
      </p>
    </div>

    <div
      v-else-if="loadError"
      class="state-card error-state"
    >
      <i class="fas fa-exclamation-circle"></i>

      <h3>
        Unable to Load Form
      </h3>

      <p>
        {{ loadError }}
      </p>

      <button
        type="button"
        @click="loadUserFields"
      >
        Try Again
      </button>
    </div>

    <div
      v-else
      class="premium-form-container"
    >
      <div class="form-header">
        <span class="form-header-label">
          ACCOUNT MANAGEMENT
        </span>

        <h2 class="form-title">
          Create New User
        </h2>

        <p class="form-subtitle">
          Enter the person's account, employment, payroll,
          identification, and performance information.
        </p>
      </div>

      <form
        novalidate
        @submit.prevent.stop="handleSubmit"
      >
        <div class="form-content">
          <section
            v-if="profilePictureField"
            class="form-section"
          >
            <div class="section-header">
              <span class="section-icon">
                <i class="fas fa-camera"></i>
              </span>

              <div>
                <h3>Profile Picture</h3>
                <p>
                  Add a JPG, PNG, or WEBP image of up to 5 MB.
                </p>
              </div>
            </div>

            <div class="section-content">
              <div class="profile-picture-area">
                <img
                  :src="profilePicturePreview"
                  alt="Profile picture preview"
                  class="profile-picture"
                  @error="handleProfilePictureError"
                />

                <div class="profile-picture-actions">
                  <label class="file-label">
                    Select Profile Picture
                  </label>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="form-input file-input"
                    :disabled="submitting"
                    @change="
                      onFileChange(
                        $event.target.files?.[0]
                      )
                    "
                  />

                  <button
                    type="button"
                    class="clear-button"
                    :disabled="submitting"
                    @click="clearFile"
                  >
                    Clear Image
                  </button>
                </div>
              </div>

              <span
                v-if="
                  backendErrorFor(
                    profilePictureField.field_name
                  ).length
                "
                class="error-message"
              >
                {{
                  backendErrorFor(
                    profilePictureField.field_name
                  )[0]
                }}
              </span>
            </div>
          </section>

          <section
            v-for="section in [
              {
                id: 'personal',
                title: 'Personal and Account Information',
                description: 'Enter the person’s identity and account information.',
                icon: 'fa-user',
                fields: personalInfoFields
              },
              {
                id: 'organization',
                title: 'Organization and Grade Information',
                description: 'Select the person’s organization, location, class, and grade.',
                icon: 'fa-sitemap',
                fields: organizationFields
              },
              {
                id: 'employment',
                title: 'Employment Information',
                description: 'Enter professional and employment information.',
                icon: 'fa-briefcase',
                fields: employmentFields
              },
              {
                id: 'dates',
                title: 'Employment Dates',
                description: 'Enter appointment, assumption, promotion, and effective dates.',
                icon: 'fa-calendar-alt',
                fields: employmentDateFields
              },
              {
                id: 'financial',
                title: 'Salary and Payroll Information',
                description: 'Enter salary levels, points, payments, and payroll status.',
                icon: 'fa-money-bill-wave',
                fields: financialFields
              },
              {
                id: 'identification',
                title: 'Identification and Banking',
                description: 'Enter identification numbers, accommodation, and bank details.',
                icon: 'fa-id-card',
                fields: identificationFields
              },
              {
                id: 'performance',
                title: 'Performance Information',
                description: 'Enter targets, focus areas, and assessment information.',
                icon: 'fa-chart-line',
                fields: performanceFields
              },
              {
                id: 'other',
                title: 'Other Information',
                description: 'Complete any remaining account information.',
                icon: 'fa-info-circle',
                fields: otherFields
              }
            ]"
            v-show="section.fields.length"
            :key="section.id"
            class="form-section"
          >
            <div class="section-header">
              <span class="section-icon">
                <i
                  class="fas"
                  :class="section.icon"
                ></i>
              </span>

              <div>
                <h3>{{ section.title }}</h3>
                <p>{{ section.description }}</p>
              </div>
            </div>

            <div class="section-content">
              <div class="form-grid">
                <div
                  v-for="field in section.fields"
                  :key="field.field_name"
                  class="form-field"
                  :class="{
                    'full-width':
                      isTextAreaField(field)
                  }"
                >
                  <label
                    class="form-label"
                    :for="
                      `new-person-${field.field_name}`
                    "
                  >
                    {{ formatLabel(field.field_name) }}

                    <span
                      v-if="isRequiredField(field)"
                      class="required-indicator"
                    >
                      *
                    </span>
                  </label>

                  <select
                    v-if="isSelectField(field)"
                    :id="
                      `new-person-${field.field_name}`
                    "
                    v-model="
                      formData[field.field_name]
                    "
                    class="form-select"
                    :disabled="submitting"
                  >
                    <option value="">
                      Select an option
                    </option>

                    <option
                      v-for="option in getOptions(field)"
                      :key="getOptionValue(option)"
                      :value="getOptionValue(option)"
                    >
                      {{ getOptionLabel(option) }}
                    </option>
                  </select>

                  <div
                    v-else-if="isManyToManyField(field)"
                    class="multiple-choice-group"
                  >
                    <label
                      v-for="option in getOptions(field)"
                      :key="getOptionValue(option)"
                      class="multiple-choice-option"
                    >
                      <input
                        v-model="
                          formData[field.field_name]
                        "
                        type="checkbox"
                        :value="getOptionValue(option)"
                        :disabled="submitting"
                      />

                      <span>
                        {{ getOptionLabel(option) }}
                      </span>
                    </label>
                  </div>

                  <label
                    v-else-if="isBooleanField(field)"
                    class="switch-control"
                  >
                    <input
                      v-model="
                        formData[field.field_name]
                      "
                      type="checkbox"
                      :disabled="submitting"
                    />

                    <span class="switch-slider"></span>

                    <span class="switch-label">
                      {{
                        formData[field.field_name]
                          ? "Yes"
                          : "No"
                      }}
                    </span>
                  </label>

                  <textarea
                    v-else-if="isTextAreaField(field)"
                    :id="
                      `new-person-${field.field_name}`
                    "
                    v-model="
                      formData[field.field_name]
                    "
                    class="form-input form-textarea"
                    rows="5"
                    :disabled="submitting"
                    :placeholder="
                      `Enter ${formatLabel(
                        field.field_name
                      ).toLowerCase()}`
                    "
                  ></textarea>

                  <input
                    v-else
                    :id="
                      `new-person-${field.field_name}`
                    "
                    v-model="
                      formData[field.field_name]
                    "
                    class="form-input"
                    :type="getInputType(field)"
                    :step="getInputStep(field)"
                    :disabled="submitting"
                    :placeholder="
                      `Enter ${formatLabel(
                        field.field_name
                      ).toLowerCase()}`
                    "
                  />

                  <span
                    v-if="
                      backendErrorFor(
                        field.field_name
                      ).length
                    "
                    class="error-message"
                  >
                    {{
                      backendErrorFor(
                        field.field_name
                      )[0]
                    }}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div
          v-if="
            backendErrors.general?.length
          "
          class="general-error"
        >
          <i class="fas fa-exclamation-circle"></i>

          <span>
            {{ backendErrors.general[0] }}
          </span>
        </div>

        <div class="form-footer">
          <button
            type="button"
            class="cancel-button"
            :disabled="submitting"
            @click="
              router.push(
                '/manager/allusers'
              )
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            class="submit-button"
            :disabled="submitting"
          >
            <span
              v-if="submitting"
              class="spinner"
            ></span>

            <i
              v-else
              class="fas fa-user-plus"
            ></i>

            {{
              submitting
                ? "Creating User..."
                : "Create User"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.new-person-page {
  width: 100%;
  padding: 20px 0 40px;
}

.premium-form-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #f8fafc;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.form-header {
  margin-bottom: 28px;
  padding: 26px;
  text-align: center;
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      #312e81,
      #4338ca
    );
}

.form-header-label {
  color: #c7d2fe;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.form-title {
  margin: 7px 0 0;
  color: #ffffff;
  font-size: 29px;
  font-weight: 800;
}

.form-subtitle {
  max-width: 760px;
  margin: 9px auto 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
  line-height: 1.6;
}

.form-section {
  margin-bottom: 22px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 11px;
}

.section-icon {
  width: 46px;
  height: 46px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #4338ca;
  border-radius: 12px;
  background: #e0e7ff;
}

.section-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 19px;
  font-weight: 800;
}

.section-header p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.section-content {
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.form-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-label {
  margin-bottom: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 750;
}

.required-indicator {
  color: #dc2626;
}

.form-input,
.form-select {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  padding: 10px 13px;
  color: #1e293b;
  font-size: 15px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  background: #ffffff;
}

.form-input:focus,
.form-select:focus {
  border-color: #4338ca;
  box-shadow:
    0 0 0 4px
    rgba(67, 56, 202, 0.1);
}

.form-textarea {
  min-height: 130px;
  resize: vertical;
}

.profile-picture-area {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-picture {
  width: 130px;
  height: 130px;
  flex-shrink: 0;
  object-fit: cover;
  border: 4px solid #e0e7ff;
  border-radius: 50%;
  background: #eef2ff;
}

.profile-picture-actions {
  min-width: 0;
  flex: 1;
}

.file-label {
  display: block;
  margin-bottom: 9px;
  color: #334155;
  font-size: 15px;
  font-weight: 700;
}

.file-input {
  min-height: 46px;
}

.clear-button {
  margin-top: 11px;
  padding: 10px 15px;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fef2f2;
  cursor: pointer;
}

.clear-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.multiple-choice-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.multiple-choice-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  background: #f8fafc;
  cursor: pointer;
}

.multiple-choice-option input {
  accent-color: #4338ca;
}

.switch-control {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 11px;
  cursor: pointer;
}

.switch-control input {
  position: absolute;
  opacity: 0;
}

.switch-slider {
  position: relative;
  width: 49px;
  height: 27px;
  border-radius: 20px;
  background: #cbd5e1;
}

.switch-slider::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
}

.switch-control input:checked +
.switch-slider {
  background: #4338ca;
}

.switch-control input:checked +
.switch-slider::after {
  transform: translateX(22px);
}

.switch-label {
  color: #475569;
  font-weight: 700;
}

.error-message {
  display: block;
  margin-top: 7px;
  padding: 8px 11px;
  color: #b91c1c;
  font-size: 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
}

.general-error {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 14px;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 11px;
  background: #fef2f2;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 11px;
  margin-top: 26px;
}

.cancel-button,
.submit-button {
  min-width: 150px;
  min-height: 50px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 800;
  border-radius: 11px;
  cursor: pointer;
}

.cancel-button {
  color: #475569;
  border: 1px solid #cbd5e1;
  background: #ffffff;
}

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #ffffff;
  border: 0;
  background: #4338ca;
  box-shadow:
    0 9px 20px
    rgba(67, 56, 202, 0.22);
}

.submit-button:hover:not(:disabled) {
  background: #3730a3;
}

.cancel-button:disabled,
.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.spinner,
.large-spinner {
  display: inline-block;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner {
  width: 18px;
  height: 18px;
  border:
    3px solid
    rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
}

.large-spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #e0e7ff;
  border-top-color: #4338ca;
}

.state-card {
  max-width: 680px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 30px auto;
  padding: 32px;
  text-align: center;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 12px 35px
    rgba(15, 23, 42, 0.08);
}

.state-card h3 {
  margin: 17px 0 8px;
  color: #1e293b;
}

.state-card p {
  margin: 0;
  color: #64748b;
}

.error-state i {
  color: #dc2626;
  font-size: 48px;
}

.error-state button {
  margin-top: 18px;
  padding: 10px 17px;
  color: #ffffff;
  font-weight: 700;
  border: 0;
  border-radius: 9px;
  background: #4338ca;
  cursor: pointer;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1000px) {
  .form-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .premium-form-container {
    padding: 17px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .profile-picture-area {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-picture {
    align-self: center;
  }

  .form-footer {
    display: grid;
    grid-template-columns: 1fr;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>