




<script setup>
import {
  onMounted,
  ref
} from "vue";

import {
  useRouter
} from "vue-router/composables";

import EditProfileForm from "@/admin_BOX/pages/UserProfile/EditProfileForm.vue";
import UserCard from "@/admin_BOX/pages/UserProfile/UserCard.vue";

import {
  manager_create_user,
  manager_user_fields
} from "../../services/api";

const router =
  useRouter();

const backendErrors =
  ref({});

const successMessage =
  ref("");

const isLoading =
  ref(true);

const isSubmitting =
  ref(false);

const errorMessage =
  ref("");

const userFields =
  ref([]);

onMounted(async () => {
  await loadUserFields();
});

async function loadUserFields() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response =
      await manager_user_fields();

    userFields.value =
      Array.isArray(response.data)
        ? response.data
        : [];

    if (
      !Array.isArray(response.data)
    ) {
      errorMessage.value =
        "The form-fields response has an invalid format.";
    }

    console.log(
      "Manager user fields:",
      userFields.value
    );
  } catch (error) {
    console.error(
      "Unable to retrieve Manager user fields:",
      error.response?.data ||
      error.message ||
      error
    );

    userFields.value = [];

    if (
      error.message?.includes(
        "Network Error"
      ) ||
      error.code ===
        "ERR_NETWORK"
    ) {
      errorMessage.value =
        "Please check your internet connection.";
    } else if (
      error.response?.status ===
        401
    ) {
      errorMessage.value =
        "Authentication is required.";
    } else if (
      error.response?.status ===
        403
    ) {
      errorMessage.value =
        error.response?.data?.detail ||
        "Manager access is required.";
    } else {
      errorMessage.value =
        error.response?.data?.detail ||
        "Something went wrong while loading the account form.";
    }
  } finally {
    isLoading.value = false;
  }
}

const checkLoading = () => {
  return isLoading.value;
};

async function handleFormSubmit(
  submittedData
) {
  if (isSubmitting.value) {
    return;
  }

  backendErrors.value = {};
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const payload =
      buildAccountPayload(
        submittedData
      );

    console.log(
      "Submitted value is FormData:",
      submittedData instanceof FormData
    );

    console.log(
      "Manager account creation JSON payload:",
      payload
    );

    const validationErrors =
      validateRequiredFields(
        payload
      );

    if (
      Object.keys(
        validationErrors
      ).length > 0
    ) {
      backendErrors.value =
        validationErrors;

      return;
    }

    isSubmitting.value = true;

    const response =
      await manager_create_user(
        payload
      );

    console.log(
      "Manager account creation response:",
      response.data
    );

    successMessage.value =
      "User created successfully!";

    setTimeout(() => {
      router.push(
        "/manager/allusers"
      );
    }, 2000);
  } catch (error) {
    console.error(
      "Unable to create Manager-region account:",
      error.response?.data ||
      error.message ||
      error
    );

    backendErrors.value =
      transformBackendErrors(
        error
      );
  } finally {
    isSubmitting.value = false;
  }
}

function buildAccountPayload(
  submittedData
) {
  const source =
    convertSubmittedDataToObject(
      submittedData
    );

  return {
    userId:
      requiredString(
        getValue(
          source,
          "userId",
          "user_id"
        )
      ),

    /*
     * The backend will enforce Role.Staff.
     * This value also prevents a missing-role
     * deserialization error if role is required
     * in AccountCreateRequest.
     */
    role:
      "Staff",

    firstName:
      nullableString(
        getValue(
          source,
          "firstName",
          "first_name"
        )
      ),

    middleName:
      nullableString(
        getValue(
          source,
          "middleName",
          "middle_name"
        )
      ),

    lastName:
      nullableString(
        getValue(
          source,
          "lastName",
          "last_name"
        )
      ),

    maidenName:
      nullableString(
        getValue(
          source,
          "maidenName",
          "maiden_name"
        )
      ),

    gender:
      nullableString(
        getValue(
          source,
          "gender"
        )
      ),

    dateOfBirth:
      nullableString(
        getValue(
          source,
          "dateOfBirth",
          "date_of_birth"
        )
      ),

    maritalStatus:
      nullableString(
        getValue(
          source,
          "maritalStatus",
          "marital_status"
        )
      ),

    academicQualificationId:
      nullableInteger(
        getValue(
          source,
          "academicQualificationId",
          "academic_qualification_id",
          "academic_qualification"
        )
      ),

    directorateId:
      nullableInteger(
        getValue(
          source,
          "directorateId",
          "directorate_id",
          "directorate"
        )
      ),

    categoryId:
      nullableInteger(
        getValue(
          source,
          "categoryId",
          "category_id",
          "category"
        )
      ),

    districtId:
      nullableInteger(
        getValue(
          source,
          "districtId",
          "district_id",
          "district"
        )
      ),

    /*
     * regionId is intentionally omitted.
     * Ktor assigns the authenticated Manager's region.
     */

    currentGradeId:
      nullableInteger(
        getValue(
          source,
          "currentGradeId",
          "current_grade_id",
          "current_grade"
        )
      ),

    nextGradeId:
      nullableInteger(
        getValue(
          source,
          "nextGradeId",
          "next_grade_id",
          "next_grade"
        )
      ),

    changeOfGradeId:
      nullableInteger(
        getValue(
          source,
          "changeOfGradeId",
          "change_of_grade_id",
          "change_of_grade"
        )
      ),

    managementUnitCostCentreId:
      nullableInteger(
        getValue(
          source,
          "managementUnitCostCentreId",
          "management_unit_cost_centre_id",
          "management_unit_cost_centre"
        )
      ),

    titleId:
      nullableInteger(
        getValue(
          source,
          "titleId",
          "title_id",
          "title"
        )
      ),

    onLeaveTypeId:
      nullableInteger(
        getValue(
          source,
          "onLeaveTypeId",
          "on_leave_type_id",
          "on_leave_type"
        )
      ),

    professional:
      nullableString(
        getValue(
          source,
          "professional"
        )
      ),

    professionalQualification:
      nullableString(
        getValue(
          source,
          "professionalQualification",
          "professional_qualification"
        )
      ),

    staffCategory:
      nullableString(
        getValue(
          source,
          "staffCategory",
          "staff_category"
        )
      ),

    fulltimeContractStaff:
      nullableString(
        getValue(
          source,
          "fulltimeContractStaff",
          "fulltime_contract_staff"
        )
      ),

    currentSalaryLevel:
      nullableString(
        getValue(
          source,
          "currentSalaryLevel",
          "current_salary_level"
        )
      ),

    currentSalaryPoint:
      nullableString(
        getValue(
          source,
          "currentSalaryPoint",
          "current_salary_point"
        )
      ),

    nextSalaryLevel:
      nullableString(
        getValue(
          source,
          "nextSalaryLevel",
          "next_salary_level"
        )
      ),

    dateOfAssumptionOfDuty:
      nullableString(
        getValue(
          source,
          "dateOfAssumptionOfDuty",
          "date_of_assumption_of_duty"
        )
      ),

    substantiveDate:
      nullableString(
        getValue(
          source,
          "substantiveDate",
          "substantive_date"
        )
      ),

    nationalEffectiveDate:
      nullableString(
        getValue(
          source,
          "nationalEffectiveDate",
          "national_effective_date"
        )
      ),

    dateOfLastPromotion:
      nullableString(
        getValue(
          source,
          "dateOfLastPromotion",
          "date_of_last_promotion"
        )
      ),

    dateOfFirstAppointment:
      nullableString(
        getValue(
          source,
          "dateOfFirstAppointment",
          "date_of_first_appointment"
        )
      ),

    singleSpineMonthlySalary:
      nullableString(
        getValue(
          source,
          "singleSpineMonthlySalary",
          "single_spine_monthly_salary"
        )
      ),

    monthlyGrossPay:
      nullableString(
        getValue(
          source,
          "monthlyGrossPay",
          "monthly_gross_pay"
        )
      ),

    annualSalary:
      nullableString(
        getValue(
          source,
          "annualSalary",
          "annual_salary"
        )
      ),

    numberOfFocusAreas:
      nullableInteger(
        getValue(
          source,
          "numberOfFocusAreas",
          "number_of_focus_areas"
        )
      ),

    numberOfTargets:
      nullableInteger(
        getValue(
          source,
          "numberOfTargets",
          "number_of_targets"
        )
      ),

    numberOfTargetsMet:
      nullableInteger(
        getValue(
          source,
          "numberOfTargetsMet",
          "number_of_targets_met"
        )
      ),

    numberOfTargetsNotMet:
      nullableInteger(
        getValue(
          source,
          "numberOfTargetsNotMet",
          "number_of_targets_not_met"
        )
      ),

    overallAssessmentScore:
      nullableString(
        getValue(
          source,
          "overallAssessmentScore",
          "overall_assessment_score"
        )
      ),

    selfAssessmentDescription:
      nullableString(
        getValue(
          source,
          "selfAssessmentDescription",
          "self_assessment_description"
        )
      ),

    phoneNumber:
      nullableString(
        getValue(
          source,
          "phoneNumber",
          "phone_number"
        )
      ),

    ghanaCardNumber:
      nullableString(
        getValue(
          source,
          "ghanaCardNumber",
          "ghana_card_number"
        )
      ),

    socialSecurityNumber:
      nullableString(
        getValue(
          source,
          "socialSecurityNumber",
          "social_security_number"
        )
      ),

    nationalHealthInsuranceNumber:
      nullableString(
        getValue(
          source,
          "nationalHealthInsuranceNumber",
          "national_health_insurance_number"
        )
      ),

    bankName:
      nullableString(
        getValue(
          source,
          "bankName",
          "bank_name"
        )
      ),

    bankAccountNumber:
      nullableString(
        getValue(
          source,
          "bankAccountNumber",
          "bank_account_number"
        )
      ),

    bankAccountBranch:
      nullableString(
        getValue(
          source,
          "bankAccountBranch",
          "bank_account_branch"
        )
      ),

    payrollStatus:
      nullableString(
        getValue(
          source,
          "payrollStatus",
          "payroll_status"
        )
      ),

    atPostOnLeave:
      nullableString(
        getValue(
          source,
          "atPostOnLeave",
          "at_post_on_leave"
        )
      ),

    accommodationStatus:
      nullableString(
        getValue(
          source,
          "accommodationStatus",
          "accommodation_status"
        )
      ),

    supervisorName:
      nullableString(
        getValue(
          source,
          "supervisorName",
          "supervisor_name"
        )
      ),

    email:
      nullableString(
        getValue(
          source,
          "email"
        )
      ),

    profilePictureUrl:
      nullableString(
        getValue(
          source,
          "profilePictureUrl",
          "profile_picture_url",
          "profile_picture"
        )
      ),

    profilePicturePublicId:
      nullableString(
        getValue(
          source,
          "profilePicturePublicId",
          "profile_picture_public_id"
        )
      ),

    standardRetirementAge:
      positiveIntegerOrDefault(
        getValue(
          source,
          "standardRetirementAge",
          "standard_retirement_age"
        ),
        60
      ),

    isActive:
      true,

    isStaff:
      true,

    isSuperuser:
      false
  };
}

function convertSubmittedDataToObject(
  submittedData
) {
  if (
    submittedData instanceof
    FormData
  ) {
    const convertedData = {};

    for (
      const [
        key,
        value
      ] of submittedData.entries()
    ) {
      /*
       * Do not send actual File objects to the
       * JSON-only Ktor endpoint.
       */
      if (
        typeof File !==
          "undefined" &&
        value instanceof File
      ) {
        if (
          value.size > 0
        ) {
          console.log(
            `File field "${key}" was excluded from the JSON request.`
          );
        }

        continue;
      }

      /*
       * Preserve repeated FormData fields as arrays.
       */
      if (
        Object.prototype
          .hasOwnProperty
          .call(
            convertedData,
            key
          )
      ) {
        const existingValue =
          convertedData[key];

        convertedData[key] =
          Array.isArray(
            existingValue
          )
            ? [
                ...existingValue,
                value
              ]
            : [
                existingValue,
                value
              ];
      } else {
        convertedData[key] =
          value;
      }
    }

    return convertedData;
  }

  if (
    submittedData &&
    typeof submittedData ===
      "object"
  ) {
    return {
      ...submittedData
    };
  }

  return {};
}

function getValue(
  source,
  ...fieldNames
) {
  for (
    const fieldName of
    fieldNames
  ) {
    if (
      Object.prototype
        .hasOwnProperty
        .call(
          source,
          fieldName
        )
    ) {
      return source[fieldName];
    }
  }

  return null;
}

function requiredString(
  value
) {
  return String(
    value ?? ""
  ).trim();
}

function nullableString(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    const firstValue =
      value.find(item => {
        return String(
          item ?? ""
        ).trim();
      });

    return firstValue ===
      undefined
      ? null
      : String(
          firstValue
        ).trim();
  }

  const normalizedValue =
    String(value).trim();

  return normalizedValue ||
    null;
}

function nullableInteger(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const normalizedValue =
    Number(value);

  return Number.isInteger(
    normalizedValue
  )
    ? normalizedValue
    : null;
}

function positiveIntegerOrDefault(
  value,
  defaultValue
) {
  const normalizedValue =
    Number(value);

  return (
    Number.isInteger(
      normalizedValue
    ) &&
    normalizedValue > 0
  )
    ? normalizedValue
    : defaultValue;
}

function validateRequiredFields(
  payload
) {
  const errors = {};

  if (!payload.userId) {
    errors.userId = [
      "Staff ID is required."
    ];
  }

  if (!payload.firstName) {
    errors.firstName = [
      "First name is required."
    ];
  }

  if (!payload.lastName) {
    errors.lastName = [
      "Last name is required."
    ];
  }

  if (
    payload.standardRetirementAge <=
    0
  ) {
    errors.standardRetirementAge = [
      "Standard retirement age must be greater than zero."
    ];
  }

  return errors;
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
        "Failed to create user."
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

  const transformedErrors = {};

  for (
    const key of
    Object.keys(responseData)
  ) {
    const errorValue =
      responseData[key];

    const messages =
      Array.isArray(errorValue)
        ? errorValue
        : [
            errorValue
          ];

    transformedErrors[key] =
      messages.map(message => {
        const text =
          String(message ?? "");

        if (
          text.includes(
            "Date has wrong format"
          )
        ) {
          return "Please provide a valid date.";
        }

        return text;
      });
  }

  if (
    Object.keys(
      transformedErrors
    ).length === 0
  ) {
    transformedErrors.general = [
      "Failed to create user."
    ];
  }

  return transformedErrors;
}
</script>

<template>
  <div class="content">
    <div class="md-layout">
      <div
        v-if="checkLoading()"
        class="loading-message"
      >
        Loading Form Fields
      </div>

      <div
        v-else-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
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
            data-background-color="green"
            title="New Entry"
            sub_title="Enter Staff data"
            :button_name="
              isSubmitting
                ? 'Adding Staff...'
                : 'Add Staff'
            "
            :backformdata="userFields"
            :backendErrors="backendErrors"
            :successMessage="successMessage"
            :disabled="isSubmitting"
            @submitForm="handleFormSubmit"
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

.error-message {
  color: red;
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
  margin: 1rem 0;
}
.loading-message {
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center;
  margin: 1rem 0;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}


</style>


