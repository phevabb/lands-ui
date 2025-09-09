
   <script setup>
   import { reactive, watch, computed, ref } from 'vue';
   import Swal from 'sweetalert2';
   import { DEFAULT_AVATAR } from '@/services/api';

   const props = defineProps({
     title: { type: String, default: 'Form Title' },
     sub_title: { type: String, default: 'Form Subtitle' },
     button_name: { type: String, default: 'Submit' },
     backformdata: { type: Array, default: () => [] },
     backendErrors: { type: Object, default: () => ({}) },
     successMessage: { type: String, default: '' },
     formValues: { type: Object, default: () => ({}) },
   });

   const emit = defineEmits(['submitForm']);

   const formData = reactive({});
   const isLoading = ref(false);
   const profilePicturePreview = ref(DEFAULT_AVATAR);
   const fileInput = ref(null);
   const profilePictureFile = ref(null);

   const personalInfoFields = computed(() => {
     console.log('backformdata:', props.backformdata.map(f => ({
       field_name: f.field_name,
       field_type: f.field_type,
       value: f.value
     })));
     return props.backformdata.filter((field) => {
       const fieldName = field.field_name ? field.field_name.toLowerCase() : '';
       return (
         ['name', 'first', 'last', 'email', 'phone', 'address', 'contact'].some(
           (substr) => fieldName.includes(substr)
         ) && fieldName !== 'profile_picture' && fieldName !== 'picture'
       );
     });
   });

   const financialFields = computed(() =>
     props.backformdata.filter((field) =>
       ['salary', 'income', 'payment', 'tax', 'bank', 'account', 'credit', 'finance'].some(
         (substr) => field.field_name.toLowerCase().includes(substr)
       )
     )
   );

   const dateFields = computed(() =>
     props.backformdata.filter((field) =>
       ['date', 'time', 'birth', 'join', 'start', 'end', 'deadline'].some((substr) =>
         field.field_name.toLowerCase().includes(substr)
       )
     )
   );

   const otherFields = computed(() => {
     const personal = personalInfoFields.value.map((f) => f.field_name);
     const financial = financialFields.value.map((f) => f.field_name);
     const dates = dateFields.value.map((f) => f.field_name);
     console.log('otherFields:', props.backformdata.filter(
       (field) => !personal.includes(field.field_name) &&
         !financial.includes(field.field_name) &&
         !dates.includes(field.field_name) &&
         field.field_name !== 'profile_picture'
     ).map(f => ({ field_name: f.field_name, field_type: f.field_type, value: f.value })));
     return props.backformdata.filter(
       (field) =>
         !personal.includes(field.field_name) &&
         !financial.includes(field.field_name) &&
         !dates.includes(field.field_name) &&
         field.field_name !== 'profile_picture'
     );
   });

   const profilePictureField = computed(() =>
     props.backformdata.find((field) => field.field_name === 'profile_picture')
   );

   const hasPersonalInfo = computed(() => personalInfoFields.value.length > 0);
   const hasFinancialInfo = computed(() => financialFields.value.length > 0);
   const hasDateInfo = computed(() => dateFields.value.length > 0);
   const hasOtherInfo = computed(() => otherFields.value.length > 0);
   const hasProfilePicture = computed(() => !!profilePictureField.value);

   watch(
     () => props.backformdata,
     (newFields) => {
       newFields.forEach((field) => {
         if (!(field.field_name in formData)) {
           formData[field.field_name] = field.field_name === 'profile_picture' ? null : props.formValues[field.field_name] || '';
         }
       });
     },
     { immediate: true, deep: true }
   );

   watch(
     () => props.formValues,
     (newValues) => {
       console.log('formValues:', newValues);
       if (newValues && Object.keys(newValues).length > 0) {
         for (const key in formData) {
           if (newValues[key] !== undefined) {
             const fieldConfig = props.backformdata.find((f) => f.field_name === key);
             if (fieldConfig && (fieldConfig.items || fieldConfig.choices)) {
               const options = fieldConfig.items || fieldConfig.choices;
               let match = options.find(
                 (opt) => opt.id === newValues[key] || opt[0] === newValues[key]
               );
               if (!match) {
                 match = options.find(
                   (opt) => opt.name === newValues[key] || opt[1] === newValues[key]
                 );
               }
               formData[key] = match ? match.id || match[0] : '';
             } else if (fieldConfig && fieldConfig.field_name === 'profile_picture') {
               profilePicturePreview.value =
                 newValues[key] ? `${api.defaults.baseURL}${newValues[key]}` : DEFAULT_AVATAR;
             } else {
               formData[key] = newValues[key];
             }
           }
         }
       }
     },
     { immediate: true, deep: true }
   );

   const onFileChange = (file) => {
     if (file) {
       if (!file.type.startsWith('image/')) {
         Swal.fire({
           icon: 'error',
           title: 'Invalid File',
           text: 'Please select an image file.',
         });
         formData.profile_picture = null;
         profilePictureFile.value = null;
         profilePicturePreview.value = DEFAULT_AVATAR;
         if (fileInput.value) fileInput.value.value = '';
         return;
       }
       if (file.size > 2 * 1024 * 1024) {
         Swal.fire({
           icon: 'error',
           title: 'File Too Large',
           text: 'Image must be less than 2MB.',
         });
         formData.profile_picture = null;
         profilePictureFile.value = null;
         profilePicturePreview.value = DEFAULT_AVATAR;
         if (fileInput.value) fileInput.value.value = '';
         return;
       }
       console.log('Selected file:', file);
       formData.profile_picture = file;
       profilePictureFile.value = file;
       profilePicturePreview.value = URL.createObjectURL(file);
     } else {
       console.log('No file selected');
       formData.profile_picture = null;
       profilePictureFile.value = null;
       profilePicturePreview.value = DEFAULT_AVATAR;
       if (fileInput.value) fileInput.value.value = '';
     }
   };

   const clearFile = () => {
     console.log('Clearing profile picture');
     formData.profile_picture = null;
     profilePictureFile.value = null;
     profilePicturePreview.value = DEFAULT_AVATAR;
     if (fileInput.value) fileInput.value.value = '';
   };

   const handleSubmit = () => {
     console.log('formData before submit:', JSON.parse(JSON.stringify(formData)));
     const formDataToSend = new FormData();
     if (profilePictureFile.value instanceof File) {
       console.log(`Appending file profile_picture:`, profilePictureFile.value);
       formDataToSend.append('profile_picture', profilePictureFile.value, profilePictureFile.value.name);
     } else {
       console.log('Skipping profile_picture: not a file or null');
     }
     for (const [key, value] of Object.entries(formData)) {
       if (key !== 'profile_picture' && value !== null && value !== '') {
         console.log(`Appending ${key}:`, value);
         formDataToSend.append(key, value);
       }
     }
     console.log('FormData to send:', formDataToSend);
     for (let [key, value] of formDataToSend.entries()) {
       console.log(`FormData entry - ${key}:`, value);
     }
     emit('submitForm', formDataToSend);
   };

   const formatLabel = (fieldName) => {
     return fieldName.replace(/_/g, ' ').toUpperCase();
   };

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

   watch(
     () => props.backendErrors,
     (newVal) => {
       if (newVal && Object.keys(newVal).length > 0) {
         Swal.fire({
           icon: 'error',
           title: 'Error',
           html: Object.entries(newVal)
             .map(([field, msgs]) => `<p><b>${field}:</b> ${msgs.join(', ')}</p>`)
             .join(''),
         });
       }
     }
   );
   </script>

   <template>
     <div class="premium-form-container">
       <div class="form-header">
         <h2 class="form-title">{{ title }}</h2>
         <p class="form-subtitle">{{ sub_title }}</p>
       </div>
       <form @submit.prevent="handleSubmit">
         <div class="form-content">
           <div class="form-section" v-if="hasProfilePicture">
             <div class="section-header"><i class="fas fa-camera"></i> Profile Picture</div>
             <div class="section-content">
               <div class="form-grid">
                 <div class="form-field">
                   <img
                     :src="profilePicturePreview"
                     alt="Profile Picture Preview"
                     class="profile-picture"
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
                     v-if="backendErrors.profile_picture"
                       class="error-message block bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2 mt-2"

                   >
                     {{ backendErrors.profile_picture[0] }}
                   </span>
                 </div>
               </div>
             </div>
           </div>
           <div class="form-section" v-if="hasPersonalInfo">
             <div class="section-header"><i class="fas fa-user"></i> Personal Information</div>
             <div class="section-content">
               <div class="form-grid">
                 <div v-for="field in personalInfoFields" :key="field.field_name" class="form-field">
                   <label class="form-label">{{ formatLabel(field.field_name) }}</label>
                   <template
                     v-if="
                       (field.field_type === 'ForeignKey' && field.items) ||
                       (field.field_type === 'CharField' && field.choices)
                     "
                   >
                     <select class="form-select" v-model="formData[field.field_name]">
                       <option value="" disabled>Select an option</option>
                       <option
                         v-for="item in field.items || field.choices"
                         :key="item.id || item[0]"
                         :value="item.id || item[0]"
                       >
                         {{ item.name || item[1] }}
                       </option>
                     </select>
                   </template>
                   <template v-else-if="field.field_type === 'DateField'">
                     <input
                       type="date"
                       class="form-input"
                       v-model="formData[field.field_name]"
                     />
                   </template>
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
           <div class="form-section" v-if="hasFinancialInfo">
             <div class="section-header"><i class="fas fa-dollar-sign"></i> Financial Information</div>
             <div class="section-content">
               <div class="form-grid">
                 <div v-for="field in financialFields" :key="field.field_name" class="form-field">
                   <label class="form-label">{{ formatLabel(field.field_name) }}</label>
                   <template
                     v-if="
                       (field.field_type === 'ForeignKey' && field.items) ||
                       (field.field_type === 'CharField' && field.choices)
                     "
                   >
                     <select class="form-select" v-model="formData[field.field_name]">
                       <option value="" disabled>Select an option</option>
                       <option
                         v-for="item in field.items || field.choices"
                         :key="item.id || item[0]"
                         :value="item.id || item[0]"
                       >
                         {{ item.name || item[1] }}
                       </option>
                     </select>
                   </template>
                   <template v-else-if="field.field_type === 'DateField'">
                     <input
                       type="date"
                       class="form-input"
                       v-model="formData[field.field_name]"
                     />
                   </template>
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
           <div class="form-section" v-if="hasDateInfo">
             <div class="section-header"><i class="fas fa-calendar-days"></i> Date Information</div>
             <div class="section-content">
               <div class="form-grid">
                 <div v-for="field in dateFields" :key="field.field_name" class="form-field">
                   <label class="form-label">{{ formatLabel(field.field_name) }}</label>
                   <template
                     v-if="
                       (field.field_type === 'ForeignKey' && field.items) ||
                       (field.field_type === 'CharField' && field.choices)
                     "
                   >
                     <select class="form-select" v-model="formData[field.field_name]">
                       <option value="" disabled>Select an option</option>
                       <option
                         v-for="item in field.items || field.choices"
                         :key="item.id || item[0]"
                         :value="item.id || item[0]"
                       >
                         {{ item.name || item[1] }}
                       </option>
                     </select>
                   </template>
                   <template v-else-if="field.field_type === 'DateField'">
                     <input
                       type="date"
                       class="form-input"
                       v-model="formData[field.field_name]"
                     />
                   </template>
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
           <div class="form-section" v-if="hasOtherInfo">
             <div class="section-header"><i class="fas fa-info-circle"></i> Other Information</div>
             <div class="section-content">
               <div class="form-grid">
                 <div v-for="field in otherFields" :key="field.field_name" class="form-field">
                   <label class="form-label">{{ formatLabel(field.field_name) }}</label>
                   <template
                     v-if="
                       (field.field_type === 'ForeignKey' && field.items) ||
                       (field.field_type === 'CharField' && field.choices)
                     "
                   >
                     <select class="form-select" v-model="formData[field.field_name]">
                       <option value="" disabled>Select an option</option>
                       <option
                         v-for="item in field.items || field.choices"
                         :key="item.id || item[0]"
                         :value="item.id || item[0]"
                       >
                         {{ item.name || item[1] }}
                       </option>
                     </select>
                   </template>
                   <template v-else-if="field.field_type === 'DateField'">
                     <input
                       type="date"
                       class="form-input"
                       v-model="formData[field.field_name]"
                     />
                   </template>
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
         <div class="form-footer">
           <button type="submit" class="submit-button" :disabled="isLoading">
             <span v-if="isLoading" class="spinner"></span>
             <i v-else class="fas fa-paper-plane"></i>
             {{ isLoading ? 'Submitting...' : button_name }}
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
  display: block;               /* make span behave like a block */
  margin-top: 5px;              /* your existing spacing */
  background-color: #fee2e2;    /* light red background */
  border: 1px solid #f87171;    /* red border */
  color: #b91c1c;               /* dark red text */
  font-size: 0.875rem;          /* same as text-sm */
  border-radius: 0.375rem;      /* rounded corners */
  padding: 0.5rem 0.75rem;      /* px-3 py-2 */
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
   @keyframes spin {
     0% { transform: rotate(0deg); }
     100% { transform: rotate(360deg); }
   }
   </style>
   