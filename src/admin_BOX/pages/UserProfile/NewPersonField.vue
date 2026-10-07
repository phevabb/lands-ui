<script setup>
const props =
  defineProps({
    field: {
      type: Object,
      required: true
    },

    modelValue: {
      type: [
        String,
        Number,
        Array,
        Object
      ],
      default: ""
    },

    error: {
      type: Array,
      default: () => []
    },

    disabled: {
      type: Boolean,
      default: false
    }
  });

const emit =
  defineEmits([
    "update:modelValue"
  ]);

function updateValue(
  value
) {
  emit(
    "update:modelValue",
    value
  );
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

function getOptions() {
  return (
    props.field.items ||
    props.field.choices ||
    []
  );
}

function isSelectField() {
  return (
    (
      props.field.field_type ===
        "ForeignKey" &&
      Array.isArray(
        props.field.items
      )
    ) ||
    (
      (
        props.field.field_type ===
          "ChoiceField" ||
        props.field.field_type ===
          "CharField"
      ) &&
      Array.isArray(
        props.field.choices
      )
    )
  );
}

function isTextArea() {
  return (
    props.field.field_type ===
      "TextField" ||
    normalizeFieldName(
      props.field.field_name
    ) ===
      "self_assessment_description"
  );
}

function getInputType() {
  switch (
    props.field.field_type
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

function getInputStep() {
  if (
    props.field.field_type ===
    "DecimalField"
  ) {
    return "0.01";
  }

  if (
    props.field.field_type ===
    "IntegerField"
  ) {
    return "1";
  }

  return undefined;
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

function formatLabel(
  fieldName
) {
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
</script>

<template>
  <div class="form-field">
    <label class="form-label">
      {{ formatLabel(field.field_name) }}

      <span
        v-if="field.required"
        class="required-indicator"
      >
        *
      </span>
    </label>

    <select
      v-if="isSelectField()"
      class="form-select"
      :value="modelValue"
      :disabled="disabled"
      @change="
        updateValue(
          $event.target.value
        )
      "
    >
      <option value="">
        Select an option
      </option>

      <option
        v-for="item in getOptions()"
        :key="getOptionValue(item)"
        :value="getOptionValue(item)"
      >
        {{ getOptionLabel(item) }}
      </option>
    </select>

    <textarea
      v-else-if="isTextArea()"
      class="form-input form-textarea"
      rows="5"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="
        `Enter ${formatLabel(
          field.field_name
        )}`
      "
      @input="
        updateValue(
          $event.target.value
        )
      "
    ></textarea>

    <input
      v-else
      class="form-input"
      :type="getInputType()"
      :step="getInputStep()"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="
        `Enter ${formatLabel(
          field.field_name
        )}`
      "
      @input="
        updateValue(
          $event.target.value
        )
      "
    />

    <span
      v-if="error?.length"
      class="error-message"
    >
      {{ error[0] }}
    </span>
  </div>
</template>