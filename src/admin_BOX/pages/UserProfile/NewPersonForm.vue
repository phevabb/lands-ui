<script setup>
import {
  computed,
  onBeforeUnmount,
  reactive,
  ref,
  watch
} from "vue";

import Swal from "sweetalert2";

import {
  DEFAULT_AVATAR
} from "@/services/api";

const props =
  defineProps({
    title: {
      type: String,
      default: "Create New User"
    },

    sub_title: {
      type: String,
      default:
        "Enter the new person's account and employment information."
    },

    button_name: {
      type: String,
      default: "Create User"
    },

    backformdata: {
      type: Array,
      default: () => []
    },

    backendErrors: {
      type: Object,
      default: () => ({})
    },

    successMessage: {
      type: String,
      default: ""
    },

    submitting: {
      type: Boolean,
      default: false
    }
  });

const emit =
  defineEmits([
    "submit-form"
  ]);

const formData =
  reactive({});

const fileInput =
  ref(null);

const profilePictureFile =
  ref(null);

const profilePicturePreview =
  ref(DEFAULT_AVATAR);

const allowedImageTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
  ]);

const maximumImageSize =
  5 * 1024 * 1024;

const profilePictureField =
  computed(() => {
    return props.backformdata.find(
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

const hasProfilePicture =
  computed(() => {
    return Boolean(
      profilePictureField.value
    );
  });

const personalInfoFields =
  computed(() => {
    const fields = [
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
    ];

    return getFieldsByNames(
      fields
    );
  });

const organizationFields =
  computed(() => {
    const fields = [
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
    ];

    return getFieldsByNames(
      fields
    );
  });

const employmentFields =
  computed(() => {
    const fields = [
      "professional",
      "professional_qualification",
      "staff_category",
      "fulltime_contract_staff",
      "at_post_on_leave",
      "supervisor_name"
    ];

    return getFieldsByNames(
      fields
    );
  });

const dateFields =
  computed(() => {
    const fields = [
      "date_of_assumption_of_duty",
      "substantive_date",
      "national_effective_date",
      "date_of_last_promotion",
      "date_of_first_appointment"
    ];

    return getFieldsByNames(
      fields
    );
  });

const financialFields =
  computed(() => {
    const fields = [
      "current_salary_level",
      "current_salary_point",
      "next_salary_level",
      "single_spine_monthly_salary",
      "monthly_gross_pay",
      "annual_salary",
      "payroll_status"
    ];

    return getFieldsByNames(
      fields
    );
  });

const identificationFields =
  computed(() => {
    const fields = [
      "ghana_card_number",
      "social_security_number",
      "national_health_insurance_number",
      "bank_name",
      "bank_account_number",
      "bank_account_branch",
      "accommodation_status"
    ];

    return getFieldsByNames(
      fields
    );
  });

const performanceFields =
  computed(() => {
    const fields = [
      "number_of_focus_areas",
      "number_of_targets",
      "number_of_targets_met",
      "number_of_targets_not_met",
      "overall_assessment_score",
      "self_assessment_description"
    ];

    return getFieldsByNames(
      fields
    );
  });

const otherFields =
  computed(() => {
    const groupedFieldNames =
      new Set(
        [
          ...personalInfoFields.value,
          ...organizationFields.value,
          ...employmentFields.value,
          ...dateFields.value,
          ...financialFields.value,
          ...identificationFields.value,
          ...performanceFields.value
        ].map(field => {
          return field.field_name;
        })
      );

    return props.backformdata.filter(
      field => {
        return (
          !groupedFieldNames.has(
            field.field_name
          ) &&
          normalizeFieldName(
            field.field_name
          ) !==
            "profile_picture_url"
        );
      }
    );
  });

watch(
  () => props.backformdata,
  fields => {
    initializeFormData(
      fields
    );
  },
  {
    immediate: true,
    deep: true
  }
);

watch(
  () => props.successMessage,
  message => {
    if (!message) {
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      timer: 2000,
      showConfirmButton: false
    });

    resetForm();
  }
);

watch(
  () => props.backendErrors,
  errors => {
    if (
      !errors ||
      typeof errors !== "object" ||
      Object.keys(errors).length === 0
    ) {
      return;
    }

    const errorHtml =
      Object.entries(errors)
        .map(
          ([
            field,
            messages
          ]) => {
            const normalizedMessages =
              Array.isArray(messages)
                ? messages
                : [
                    messages
                  ];

            return `
              <p>
                <b>${escapeHtml(
                  formatLabel(field)
                )}:</b>
                ${normalizedMessages
                  .map(String)
                  .join(", ")}
              </p>
            `;
          }
        )
        .join("");

    Swal.fire({
      icon: "error",
      title: "Unable to Create User",
      html: errorHtml
    });
  },
  {
    deep: true
  }
);

onBeforeUnmount(() => {
  revokeTemporaryPreview();
});

function initializeFormData(
  fields
) {
  if (!Array.isArray(fields)) {
    return;
  }

  fields.forEach(field => {
    const fieldName =
      field.field_name;

    if (!fieldName) {
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        formData,
        fieldName
      )
    ) {
      return;
    }

    if (
      field.field_type ===
      "ManyToManyField"
    ) {
      formData[fieldName] = [];

      return;
    }

    const normalizedName =
      normalizeFieldName(
        fieldName
      );

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

    formData[fieldName] = "";
  });
}

function getFieldsByNames(
  normalizedNames
) {
  const acceptedNames =
    new Set(
      normalizedNames
    );

  return props.backformdata.filter(
    field => {
      return acceptedNames.has(
        normalizeFieldName(
          field.field_name
        )
      );
    }
  );
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

function isSelectionField(
  field
) {
  return Boolean(
    (
      field.field_type ===
        "ForeignKey" &&
      Array.isArray(
        field.items
      )
    ) ||
    (
      (
        field.field_type ===
          "ChoiceField" ||
        field.field_type ===
          "CharField"
      ) &&
      Array.isArray(
        field.choices
      )
    )
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

function isRequiredField(
  field
) {
  return field.required ===
    true;
}

function formatLabel(
  fieldName
) {
  if (!fieldName) {
    return "";
  }

  const normalizedName =
    normalizeFieldName(
      fieldName
    );

  if (
    normalizedName ===
    "user_id"
  ) {
    return "STAFF ID";
  }

  if (
    normalizedName ===
    "academic_qualification_id"
  ) {
    return "ACADEMIC QUALIFICATION";
  }

  if (
    normalizedName ===
    "management_unit_cost_centre_id"
  ) {
    return "MANAGEMENT UNIT";
  }

  if (
    normalizedName ===
    "category_id"
  ) {
    return "STAFF CLASS";
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
      title: "Invalid File",
      text:
        "Select a JPG, JPEG, PNG, or WEBP image."
    });

    clearFile();

    return;
  }

  if (
    file.size >
    maximumImageSize
  ) {
    Swal.fire({
      icon: "error",
      title: "File Too Large",
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

  const profileFieldName =
    profilePictureField.value
      ?.field_name;

  if (profileFieldName) {
    formData[profileFieldName] =
      file;
  }
}

function clearFile() {
  revokeTemporaryPreview();

  profilePictureFile.value =
    null;

  profilePicturePreview.value =
    DEFAULT_AVATAR;

  const profileFieldName =
    profilePictureField.value
      ?.field_name;

  if (profileFieldName) {
    formData[profileFieldName] =
      null;
  }

  if (fileInput.value) {
    fileInput.value.value =
      "";
  }
}

function handleSubmit() {
  if (props.submitting) {
    return;
  }

  const clientErrors =
    validateForm();

  if (
    Object.keys(clientErrors).length >
    0
  ) {
    const firstError =
      Object.values(
        clientErrors
      )[0]?.[0];

    Swal.fire({
      icon: "error",
      title: "Check the Form",
      text:
        firstError ||
        "Complete all required fields."
    });

    return;
  }

  const requestData =
    new FormData();

  for (
    const [
      key,
      value
    ] of Object.entries(
      formData
    )
  ) {
    if (
      normalizeFieldName(key) ===
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
            key,
            String(
              normalizedValue
            )
          );
        }
      });

      continue;
    }

    requestData.append(
      key,
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

  console.log(
    "Creating new account"
  );

  console.log(
    "Profile picture included:",
    profilePictureFile.value instanceof
      File
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
          name: value.name,
          type: value.type,
          size: value.size
        }
      );
    } else {
      console.log(
        key,
        value
      );
    }
  }

  emit(
    "submit-form",
    requestData
  );
}

function validateForm() {
  const errors = {};

  props.backformdata.forEach(
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

      const isEmpty =
        value === null ||
        value === undefined ||
        String(value).trim() === "";

      if (isEmpty) {
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

  const targets =
    getNumericFormValue(
      "numberOfTargets"
    );

  const targetsMet =
    getNumericFormValue(
      "numberOfTargetsMet"
    );

  const targetsNotMet =
    getNumericFormValue(
      "numberOfTargetsNotMet"
    );

  if (
    targets !== null &&
    targetsMet !== null &&
    targetsNotMet !== null &&
    targetsMet +
      targetsNotMet >
      targets
  ) {
    errors.numberOfTargets = [
      "Targets met and targets not met cannot exceed the total number of targets."
    ];
  }

  return errors;
}

function getNumericFormValue(
  fieldName
) {
  const matchingKey =
    Object.keys(
      formData
    ).find(key => {
      return (
        normalizeFieldName(key) ===
        normalizeFieldName(
          fieldName
        )
      );
    });

  if (!matchingKey) {
    return null;
  }

  const value =
    Number(
      formData[
        matchingKey
      ]
    );

  return Number.isFinite(value)
    ? value
    : null;
}

function resetForm() {
  Object.keys(
    formData
  ).forEach(key => {
    const field =
      props.backformdata.find(
        item => {
          return (
            item.field_name ===
            key
          );
        }
      );

    if (
      field?.field_type ===
      "ManyToManyField"
    ) {
      formData[key] = [];

      return;
    }

    if (
      normalizeFieldName(key) ===
      "standard_retirement_age"
    ) {
      formData[key] = 60;

      return;
    }

    if (
      normalizeFieldName(key) ===
      "profile_picture_url"
    ) {
      formData[key] = null;

      return;
    }

    formData[key] = "";
  });

  clearFile();
}

function escapeHtml(
  value
) {
  const element =
    document.createElement(
      "div"
    );

  element.textContent =
    String(
      value ?? ""
    );

  return element.innerHTML;
}
</script>