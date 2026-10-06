<script setup>
import { reactive, watch, computed, ref } from 'vue';
import Swal from 'sweetalert2';
import { DEFAULT_AVATAR, api } from '@/services/api';

// Props definition
const props = defineProps({
  title: {
    type: String,
    default: "Form Title"
  },

  sub_title: {
    type: String,
    default: "Form Subtitle"
  },

  button_name: {
    type: String,
    default: "Submit"
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

  formValues: {
    type: Object,
    default: () => ({})
  },

  submitting: {
    type: Boolean,
    default: false
  }
});





const handleProfilePictureError =
  event => {
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
  };



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



function resolveProfilePictureUrl(
  profilePicture
) {
  if (
    !profilePicture ||
    profilePicture === "-"
  ) {
    return DEFAULT_AVATAR;
  }

  const pictureUrl =
    String(
      profilePicture
    ).trim();

  if (
    pictureUrl.startsWith("http://") ||
    pictureUrl.startsWith("https://") ||
    pictureUrl.startsWith("data:") ||
    pictureUrl.startsWith("blob:")
  ) {
    return pictureUrl;
  }

  if (
    pictureUrl.startsWith("//")
  ) {
    return `https:${pictureUrl}`;
  }

  const baseUrl =
    String(
      api.defaults.baseURL ?? ""
    ).replace(
      /\/+$/,
      ""
    );

  const relativePath =
    pictureUrl.replace(
      /^\/+/,
      ""
    );

  if (!baseUrl) {
    return `/${relativePath}`;
  }

  return `${baseUrl}/${relativePath}`;
}


const removeProfilePicture =
  ref(false);



// Emits definition
const emit =
  defineEmits([
    "submit-form"
  ]);

// Reactive state and refs
const formData = reactive({});

const profilePicturePreview = ref(DEFAULT_AVATAR);
const fileInput = ref(null);
const profilePictureFile = ref(null);

// Computed property for personal information fields
const personalInfoFields =
  computed(() => {
    return props.backformdata
      .filter(field => {
        const fieldName =
          String(
            field.field_name ?? ""
          );

        const normalizedName =
          fieldName
            .replace(
              /([a-z0-9])([A-Z])/g,
              "$1_$2"
            )
            .toLowerCase();

        const personalKeywords = [
          "name",
          "gender",
          "marital_status",
          "title",
          "user_id",
          "first",
          "birth",
          "last",
          "email",
          "phone",
          "address",
          "contact"
        ];

        const excludedFields = [
          "profile_picture_url",
          "profile_picture_public_id",
          "picture",
          "date_of_last_promotion",
          "bank_name",
          "date_of_first_appointment"
        ];

        return (
          personalKeywords.some(
            keyword => {
              return normalizedName.includes(
                keyword
              );
            }
          ) &&
          !excludedFields.includes(
            normalizedName
          )
        );
      })
      .map(field => {
        return {
          ...field,

          display_name:
            formatLabel(
              field.field_name
            )
        };
      });
  });




// Computed property for financial fields
const financialFields = computed(() =>
  props.backformdata.filter((field) =>
    ['salary', 'income', 'payment', 'tax', 'bank', 'account', 'credit', 'finance'].some(
      (substr) => field.field_name.toLowerCase().includes(substr)
    )
  )
);

// Computed property for date fields
const dateFields = computed(() =>
  props.backformdata.filter((field) => {
    const fieldName = field.field_name ? field.field_name.toLowerCase() : '';
    return (
      ['date', 'time', 'join', 'start', 'end', 'deadline'].some((substr) =>
        fieldName.includes(substr)
      ) &&
      fieldName !== 'date_of_birth' &&
      fieldName !== 'gender'
    );
  })
);

// Computed property for other fields (including academic_qualifications)
const otherFields = computed(() => {
  const personal = personalInfoFields.value.map((f) => f.field_name);
  const financial = financialFields.value.map((f) => f.field_name);
  const dates = dateFields.value.map((f) => f.field_name);
  return props.backformdata.filter(
    (field) =>
      !personal.includes(field.field_name) &&
      !financial.includes(field.field_name) &&
      !dates.includes(field.field_name) &&
      field.field_name !== 'profilePictureUrl' &&
      field.field_name !== 'user_id' &&
      field.field_name !== 'title' &&
      field.field_name !== 'marital_status'
  );
});

// Computed property for profile picture field
const profilePictureField = computed(() =>
  props.backformdata.find((field) => field.field_name === 'profilePictureUrl')
);

// Computed properties for section visibility
const hasPersonalInfo = computed(() => personalInfoFields.value.length > 0);
const hasFinancialInfo = computed(() => financialFields.value.length > 0);
const hasDateInfo = computed(() => dateFields.value.length > 0);
const hasOtherInfo = computed(() => otherFields.value.length > 0);
const hasProfilePicture = computed(() => !!profilePictureField.value);

// Initialize formData based on backformdata
watch(
  () => props.backformdata,
  newFields => {
    if (!Array.isArray(newFields)) {
      return;
    }

    newFields.forEach(field => {
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

      const currentValue =
        props.formValues?.[fieldName];

      if (
        field.field_type ===
        "ManyToManyField"
      ) {
        formData[fieldName] =
          Array.isArray(currentValue)
            ? currentValue
            : [];

        return;
      }

      if (
        fieldName ===
        "profilePictureUrl"
      ) {
        formData[fieldName] =
          currentValue ??
          null;

        profilePicturePreview.value =
          resolveProfilePictureUrl(
            currentValue
          );

        return;
      }

      formData[fieldName] =
        currentValue ??
        "";
    });
  },
  {
    immediate: true,
    deep: true
  }
);









// Watch formValues to pre-fill form data
watch(
  () => props.formValues,
  newValues => {
    if (
      !newValues ||
      typeof newValues !== "object" ||
      Object.keys(newValues).length === 0
    ) {
      return;
    }

    for (
      const field of
      props.backformdata
    ) {
      const fieldName =
        field.field_name;

      if (
        !fieldName ||
        newValues[fieldName] ===
          undefined
      ) {
        continue;
      }

      const newValue =
        newValues[fieldName];

      if (
        fieldName ===
        "profilePictureUrl"
      ) {
        /*
         * Keep the existing URL in formData.
         * Do not prepend the Ktor API base URL
         * when it is already a Cloudinary URL.
         */
        formData[fieldName] =
          newValue ??
          null;

        profilePicturePreview.value =
          resolveProfilePictureUrl(
            newValue
          );

        profilePictureFile.value =
          null;

        continue;
      }

      if (
        field.field_type ===
        "ManyToManyField"
      ) {
        formData[fieldName] =
          Array.isArray(newValue)
            ? newValue.map(item => {
                return (
                  item?.id ??
                  item
                );
              })
            : [];

        continue;
      }

      const options =
        field.items ||
        field.choices;

      if (
        Array.isArray(options)
      ) {
        const match =
          options.find(option => {
            const optionValue =
              getOptionValue(
                option
              );

            const optionLabel =
              getOptionLabel(
                option
              );

            return (
              String(optionValue) ===
                String(newValue) ||
              String(optionLabel) ===
                String(newValue)
            );
          });

        formData[fieldName] =
          match
            ? getOptionValue(match)
            : newValue ?? "";

        continue;
      }

      formData[fieldName] =
        newValue ??
        "";
    }
  },
  {
    immediate: true,
    deep: true
  }
);


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

const onFileChange = file => {
  if (!file) {
    profilePictureFile.value =
      null;

    formData.profilePictureUrl =
      props.formValues
        ?.profilePictureUrl ??
      null;

    profilePicturePreview.value =
      resolveProfilePictureUrl(
        props.formValues
          ?.profilePictureUrl
      );

    return;
  }

  if (
    !file.type.startsWith(
      "image/"
    )
  ) {
    Swal.fire({
      icon:
        "error",

      title:
        "Invalid File",

      text:
        "Please select an image file."
    });

    profilePictureFile.value =
      null;

    formData.profilePictureUrl =
      props.formValues
        ?.profilePictureUrl ??
      null;

    profilePicturePreview.value =
      resolveProfilePictureUrl(
        props.formValues
          ?.profilePictureUrl
      );

    if (fileInput.value) {
      fileInput.value.value =
        "";
    }

    return;
  }

  const maximumFileSize =
    2 * 1024 * 1024;

  if (
    file.size >
    maximumFileSize
  ) {
    Swal.fire({
      icon:
        "error",

      title:
        "File Too Large",

      text:
        "Image must be less than 2MB."
    });

    profilePictureFile.value =
      null;

    formData.profilePictureUrl =
      props.formValues
        ?.profilePictureUrl ??
      null;

    profilePicturePreview.value =
      resolveProfilePictureUrl(
        props.formValues
          ?.profilePictureUrl
      );

    if (fileInput.value) {
      fileInput.value.value =
        "";
    }

    return;
  }

  revokeTemporaryPreview();

removeProfilePicture.value =
  false;

profilePictureFile.value =
  file;

formData.profilePictureUrl =
  file;

profilePicturePreview.value =
  URL.createObjectURL(
    file
  );
};










const clearFile = () => {
  revokeTemporaryPreview();

  formData.profilePictureUrl =
    null;

  profilePictureFile.value =
    null;

  profilePicturePreview.value =
    DEFAULT_AVATAR;

  removeProfilePicture.value =
    true;

  if (fileInput.value) {
    fileInput.value.value =
      "";
  }
};






// Handle form submission
const handleSubmit = () => {
  console.log(
    "Child form submit triggered"
  );

  if (props.submitting) {
    console.log(
      "Submission already in progress"
    );

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
      key ===
      "profilePictureUrl"
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
      requestData.delete(
        key
      );

      value.forEach(item => {
        const normalizedValue =
          item &&
          typeof item ===
            "object"
            ? item.id ??
              item.value
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
      "profilePictureUrl",
      profilePictureFile.value,
      profilePictureFile.value.name
    );
  }

  requestData.append(
    "removeProfilePicture",
    String(
      removeProfilePicture.value
    )
  );

  console.log(
    "New profile picture included:",
    profilePictureFile.value instanceof
      File
  );

  console.log(
    "Remove profile picture:",
    removeProfilePicture.value
  );

  console.log(
    "Multipart form values:"
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

  console.log(
    "Emitting submit-form event"
  );

  emit(
    "submit-form",
    requestData
  );
};










// Format field labels
const formatLabel = fieldName => {
  if (!fieldName) {
    return "";
  }

  if (
    fieldName === "userId" ||
    fieldName === "user_id"
  ) {
    return "STAFF ID";
  }

  if (
    fieldName ===
      "academicQualificationId" ||
    fieldName ===
      "academicQualifications" ||
    fieldName ===
      "academic_qualifications"
  ) {
    return "ACADEMIC QUALIFICATION";
  }

  return String(
    fieldName
  )
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /_/g,
      " "
    )
    .toUpperCase();
};

// Watch for success message
watch(
  () => props.successMessage,
  (newVal) => {
    if (newVal) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: newVal,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }
);

// Watch for backend errors
watch(
  () => props.backendErrors,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: Object.entries(newVal)
          .map(([field, msgs]) => `<p><b>${formatLabel(field)}:</b> ${msgs.join(', ')}</p>`)
          .join(''),
      });
    }
  }
);
</script>

<template>
  <div class="premium-form-container">
    <!-- Form Header -->
    <div class="form-header">
      <h2 class="form-title">{{ title }}</h2>
      <p class="form-subtitle">{{ sub_title }}</p>
    </div>

    <!-- Form -->
    <form
  novalidate
  @submit.prevent.stop="handleSubmit"
>
      <div class="form-content">
        <!-- Profile Picture Section -->
        <div class="form-section" v-if="hasProfilePicture">
          <div class="section-header"><i class="fas fa-camera"></i> Profile Picture</div>
          <div class="section-content">
            <div class="form-grid">
              <div class="form-field">
                <img
  :src="profilePicturePreview"
  alt="Profile Picture Preview"
  class="profile-picture"
  @error="handleProfilePictureError"
/>
                <label class="form-label">PROFILE PICTURE</label>
                <input
                  type="file"
                  accept="image/*"
                  class="form-input file-input"
                  ref="fileInput"
                  @change="onFileChange($event.target.files[0])"
                />
                <button type="button" class="clear-button" @click="clearFile">Clear Image</button>
                <span
                  v-if="backendErrors.profilePictureUrl"
                  class="error-message block bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2 mt-2"
                >
                  {{ backendErrors.profilePictureUrl[0] }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Information Section -->
        <div class="form-section" v-if="hasPersonalInfo">
          <div class="section-header"><i class="fas fa-user"></i> Personal Information</div>
          <div class="section-content">
            <div class="form-grid">
              <div v-for="field in personalInfoFields" :key="field.field_name" class="form-field">
                <label class="form-label">{{ formatLabel(field.field_name) }}</label>
                <!-- ForeignKey or CharField with choices -->
               <template
  v-if="
    (
      field.field_type === 'ForeignKey' &&
      field.items
    ) ||
    (
      (
        field.field_type === 'ChoiceField' ||
        field.field_type === 'CharField'
      ) &&
      field.choices
    )
  "
>
  <select
    v-model="formData[field.field_name]"
    class="form-select"
  >
    <option
      value=""
      disabled
    >
      Select an option
    </option>

    <option
      v-for="item in field.items || field.choices"
      :key="getOptionValue(item)"
      :value="getOptionValue(item)"
    >
      {{ getOptionLabel(item) }}
    </option>
  </select>
</template>
                <!-- DateField -->
                <template v-else-if="field.field_type === 'DateField'">
                  <input
                    type="date"
                    class="form-input"
                    v-model="formData[field.field_name]"
                  />
                </template>
                <!-- Default text input -->
                <template v-else>
                  <input
                    type="text"
                    class="form-input"
                    :placeholder="`Enter ${formatLabel(field.field_name)}`"
                    v-model="formData[field.field_name]"
                  />
                </template>
                <span
                  v-if="backendErrors[field.field_name]"
                  class="error-message block bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2 mt-2"
                >
                  {{ backendErrors[field.field_name][0] }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Information Section -->
        <div class="form-section" v-if="hasFinancialInfo">
          <div class="section-header"><i class="fas fa-dollar-sign"></i> Financial Information</div>
          <div class="section-content">
            <div class="form-grid">
              <div v-for="field in financialFields" :key="field.field_name" class="form-field">
                <label class="form-label">{{ formatLabel(field.field_name) }}</label>
                <!-- ForeignKey or CharField with choices -->
               <template
  v-if="
    (
      field.field_type === 'ForeignKey' &&
      field.items
    ) ||
    (
      (
        field.field_type === 'ChoiceField' ||
        field.field_type === 'CharField'
      ) &&
      field.choices
    )
  "
>
  <select
    v-model="formData[field.field_name]"
    class="form-select"
  >
    <option
      value=""
      disabled
    >
      Select an option
    </option>

    <option
      v-for="item in field.items || field.choices"
      :key="getOptionValue(item)"
      :value="getOptionValue(item)"
    >
      {{ getOptionLabel(item) }}
    </option>
  </select>
</template>
                <!-- DateField -->
                <template v-else-if="field.field_type === 'DateField'">
                  <input
                    type="date"
                    class="form-input"
                    v-model="formData[field.field_name]"
                  />
                </template>
                <!-- Default text input -->
                <template v-else>
                  <input
                    type="text"
                    class="form-input"
                    :placeholder="`Enter ${formatLabel(field.field_name)}`"
                    v-model="formData[field.field_name]"
                  />
                </template>
                <span
                  v-if="backendErrors[field.field_name]"
                  class="error-message block bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2 mt-2"
                >
                  {{ backendErrors[field.field_name][0] }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Date Information Section -->
        <div class="form-section" v-if="hasDateInfo">
          <div class="section-header"><i class="fas fa-calendar-days"></i> Date Information</div>
          <div class="section-content">
            <div class="form-grid">
              <div v-for="field in dateFields" :key="field.field_name" class="form-field">
                <label class="form-label">{{ formatLabel(field.field_name) }}</label>
                <!-- ForeignKey or CharField with choices -->
                <template
  v-if="
    (
      field.field_type === 'ForeignKey' &&
      field.items
    ) ||
    (
      (
        field.field_type === 'ChoiceField' ||
        field.field_type === 'CharField'
      ) &&
      field.choices
    )
  "
>
  <select
    v-model="formData[field.field_name]"
    class="form-select"
  >
    <option
      value=""
      disabled
    >
      Select an option
    </option>

    <option
      v-for="item in field.items || field.choices"
      :key="getOptionValue(item)"
      :value="getOptionValue(item)"
    >
      {{ getOptionLabel(item) }}
    </option>
  </select>
</template>
                <!-- DateField -->
                <template v-else-if="field.field_type === 'DateField'">
                  <input
                    type="date"
                    class="form-input"
                    v-model="formData[field.field_name]"
                  />
                </template>
                <!-- Default text input -->
                <template v-else>
                  <input
                    type="text"
                    class="form-input"
                    :placeholder="`Enter ${formatLabel(field.field_name)}`"
                    v-model="formData[field.field_name]"
                  />
                </template>
                <span
                  v-if="backendErrors[field.field_name]"
                  class="error-message block bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2 mt-2"
                >
                  {{ backendErrors[field.field_name][0] }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Information Section -->
        <div class="form-section" v-if="hasOtherInfo">
          <div class="section-header"><i class="fas fa-info-circle"></i> Other Information</div>
          <div class="section-content">
            <div class="form-grid">
              <div v-for="field in otherFields" :key="field.field_name" class="form-field">
                <label class="form-label">{{ formatLabel(field.field_name) }}</label>
                <!-- Academic Qualifications (ManyToManyField) -->
                <template v-if="field.field_name === 'academic_qualifications' && field.field_type === 'ManyToManyField' && field.items">
                  <div class="premium-checkbox-group">
                    <label v-for="item in field.items" :key="item.id" class="premium-checkbox-label">
                      <input
                        type="checkbox"
                        :value="item.id"
                        v-model="formData[field.field_name]"
                        :checked="Array.isArray(formData[field.field_name]) && formData[field.field_name].includes(item.id)"
                        class="premium-checkbox"
                      />
                      <span class="premium-checkbox-text">{{ item.name }}</span>
                    </label>
                  </div>
                </template>
                <!-- Other ManyToManyField (excluding academic_qualifications) -->
                <template v-else-if="field.field_type === 'ManyToManyField' && field.items && field.field_name !== 'academic_qualifications'">
                  <select class="form-select" v-model="formData[field.field_name]" multiple>
                    <option value="" disabled>Select options</option>
                    <option v-for="item in field.items" :key="item.id" :value="item.id">
                      {{ item.name }}
                    </option>
                  </select>
                </template>
                <!-- ForeignKey or CharField with choices -->
             <template
  v-if="
    (
      field.field_type === 'ForeignKey' &&
      field.items
    ) ||
    (
      (
        field.field_type === 'ChoiceField' ||
        field.field_type === 'CharField'
      ) &&
      field.choices
    )
  "
>
  <select
    v-model="formData[field.field_name]"
    class="form-select"
  >
    <option
      value=""
      disabled
    >
      Select an option
    </option>

    <option
      v-for="item in field.items || field.choices"
      :key="getOptionValue(item)"
      :value="getOptionValue(item)"
    >
      {{ getOptionLabel(item) }}
    </option>
  </select>
</template>
                <!-- DateField -->
                <template v-else-if="field.field_type === 'DateField'">
                  <input
                    type="date"
                    class="form-input"
                    v-model="formData[field.field_name]"
                  />
                </template>
                <!-- Default text input -->
                <template v-else>
                  <input
                    type="text"
                    class="form-input"
                    :placeholder="`Enter ${formatLabel(field.field_name)}`"
                    v-model="formData[field.field_name]"
                  />
                </template>
                <span
                  v-if="backendErrors[field.field_name]"
                  class="error-message block bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2 mt-2"
                >
                  {{ backendErrors[field.field_name][0] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Footer -->
      <div class="form-footer">
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
      class="fas fa-paper-plane"
    ></i>

    {{
      submitting
        ? "Submitting..."
        : button_name
    }}
  </button>
      </div>
    </form>
  </div>


</template>

<style scoped>
.premium-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.form-subtitle {
  font-size: 16px;
  color: #666;
}

.form-section {
  margin-bottom: 20px;
}

.section-header {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-content {
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.form-input,
.form-select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.form-select[multiple] {
  height: 150px;
  overflow-y: auto;
}

.file-input {
  padding: 5px;
}

.profile-picture {
  max-width: 100px;
  max-height: 100px;
  margin-bottom: 10px;
  border-radius: 4px;
  object-fit: cover;
}

.clear-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #ccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  display: block;
  margin-top: 5px;
  background-color: #fee2e2;
  border: 1px solid #f87171;
  color: #b91c1c;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.submit-button {
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

/* Premium Checkbox Group */
.premium-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.premium-checkbox-label {
  display: flex;
  align-items: center;
  background: #f9fafb; /* subtle background */
  border: 2px solid #e5e7eb; /* light gray */
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 14px;
  font-weight: 500;
}

.premium-checkbox-label:hover {
  background: #f3f4f6;
  border-color: #6366f1; /* Indigo highlight */
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.15);
}

.premium-checkbox {
  margin-right: 10px;
  accent-color: #6366f1; /* modern indigo color */
  width: 18px;
  height: 18px;
}

.premium-checkbox-text {
  color: #111827;
}

.premium-checkbox:checked + .premium-checkbox-text {
  font-weight: 600;
  color: #4f46e5; /* darker indigo */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>