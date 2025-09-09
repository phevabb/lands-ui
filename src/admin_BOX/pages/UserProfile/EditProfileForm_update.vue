
   <script setup>
   import { reactive, watch, computed, ref } from 'vue';
   import Swal from 'sweetalert2';
   import { DEFAULT_AVATAR } from '@/services/api';
   import api from '../../../services/api';

   const props = defineProps({
     title: { type: String, default: 'Form Title' },
     sub_title: { type: String, default: 'Form Subtitle' },
     button_name: { type: String, default: 'Submit' },
     backformdata: { type: Array, default: () => [] },
     backendErrors: { type: Object, default: () => ({}) },
     successMessage: { type: String, default: '' },
     formValues: Object,
   });

   const emit = defineEmits(['submitForm']);

   const formData = reactive({});
   const isLoading = ref(false);
   const profilePicturePreview = ref(DEFAULT_AVATAR);
   const fileInput = ref(null);

   const personalInfoFields = computed(() =>
     props.backformdata.filter((field) =>
       ['name', 'first', 'last', 'email', 'phone', 'address', 'contact'].some((substr) =>
         field.field_name.toLowerCase().includes(substr)
       )
     )
   );

   const financialFields = computed(() =>
     props.backformdata.filter((field) =>
       ['salary', 'income', 'payment', 'tax', 'bank', 'account', 'credit', 'finance'].some(
         (substr) => field.field_name.includes(substr)
       )
     )
   );

   const dateFields = computed(() =>
     props.backformdata.filter((field) =>
       ['date', 'time', 'birth', 'join', 'start', 'end', 'deadline'].some((substr) =>
         field.field_name.includes(substr)
       )
     )
   );

   const otherFields = computed(() => {
     const personal = personalInfoFields.value.map((f) => f.field_name);
     const financial = financialFields.value.map((f) => f.field_name);
     const dates = dateFields.value.map((f) => f.field_name);
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
           formData[field.field_name] = field.field_type === 'ImageField' ? null : '';
         }
       });
     },
     { immediate: true, deep: true }
   );

   watch(
     () => props.formValues,
     (newValues) => {
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
             } else if (fieldConfig && fieldConfig.field_type === 'ImageField') {
               formData[key] = null;
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
         profilePicturePreview.value =
           props.formValues.profile_picture
             ? `${api.defaults.baseURL}${props.formValues.profile_picture}`
             : DEFAULT_AVATAR;
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
         profilePicturePreview.value =
           props.formValues.profile_picture
             ? `${api.defaults.baseURL}${props.formValues.profile_picture}`
             : DEFAULT_AVATAR;
         if (fileInput.value) fileInput.value.value = '';
         return;
       }
       console.log('Selected file:', file);
       formData.profile_picture = file;
       profilePicturePreview.value = URL.createObjectURL(file);
     } else {
       console.log('No file selected');
       formData.profile_picture = null;
       profilePicturePreview.value =
         props.formValues.profile_picture
           ? `${api.defaults.baseURL}${props.formValues.profile_picture}`
           : DEFAULT_AVATAR;
       if (fileInput.value) fileInput.value.value = '';
     }
   };

   const clearFile = () => {
     console.log('Clearing profile picture');
     formData.profile_picture = null;
     profilePicturePreview.value =
       props.formValues.profile_picture
         ? `${api.defaults.baseURL}${props.formValues.profile_picture}`
         : DEFAULT_AVATAR;
     if (fileInput.value) fileInput.value.value = '';
   };

   const handleSubmit = () => {
     console.log('formData before submit:', JSON.parse(JSON.stringify(formData)));
     const formDataToSend = new FormData();
     for (const [key, value] of Object.entries(formData)) {
       if (key === 'profile_picture') {
         if (value instanceof File) {
           console.log(`Appending file ${key}:`, value);
           formDataToSend.append(key, value, value.name);
         } else {
           console.log(`Skipping ${key}: not a file or null`);
         }
       } else if (value !== null && value !== '') {
         console.log(`Appending ${key}:`, value);
         if (props.backformdata.find((f) => f.field_name === key)?.field_type === 'ForeignKey') {
           formDataToSend.append(key, Number(value));
         } else {
           formDataToSend.append(key, value);
         }
       }
     }
     // Create a fresh FormData to avoid corruption
     const finalFormData = new FormData();
     for (let [key, value] of formDataToSend.entries()) {
       finalFormData.append(key, value);
     }
     console.log('FormData to send:', finalFormData);
     for (let [key, value] of finalFormData.entries()) {
       console.log(`FormData entry - ${key}:`, value);
     }
     emit('submitForm', finalFormData);
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

   watch(
     () => formData.profile_picture,
     (newFile) => {
       console.log('formData.profile_picture changed:', newFile);
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
                     class="profile-picture-preview"
                   />
                   <label class="form-label">PROFILE PICTURE</label>
                   <input
                     type="file"
                     accept="image/*"
                     class="form-input"
                     ref="fileInput"
                     @change="onFileChange($event.target.files[0])"
                   />
                   <button type="button" class="clear-button" @click="clearFile">Clear Image</button>
                   <span
                     v-if="backendErrors.profile_picture"
                     class="error-message text-red-500 text-sm"
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
                     class="error-message text-red-500 text-sm"
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
                     class="error-message text-red-500 text-sm"
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
                     class="error-message text-red-500 text-sm"
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
                     class="error-message text-red-500 text-sm"
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
   * {
     margin: 0;
     padding: 0;
     box-sizing: border-box;
     font-family: 'Inter', sans-serif;
   }

   .error-message {
     background-color: #f8d7da;
     color: #721c24;
     border: 1px solid #f5c6cb;
     padding: 8px 12px;
     border-radius: 4px;
     margin-top: 4px;
     font-size: 0.9rem;
   }

   .premium-form-container {
     width: 100%;
     max-width: 1000px;
     background: white;
     border-radius: 16px;
     overflow: hidden;
     box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
     transition: all 0.3s ease;
   }

   .premium-form-container:hover {
     box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
   }

   .form-header {
     padding: 30px;
     background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
     color: white;
     position: relative;
     overflow: hidden;
   }

   .form-header::after {
     content: '';
     position: absolute;
     top: -50%;
     right: -50%;
     width: 100%;
     height: 200%;
     background: rgba(255, 255, 255, 0.1);
     transform: rotate(30deg);
   }

   .form-title {
     font-size: 24px;
     font-weight: 700;
     margin-bottom: 8px;
     position: relative;
     z-index: 2;
   }

   .form-subtitle {
     font-size: 14px;
     font-weight: 400;
     opacity: 0.9;
     position: relative;
     z-index: 2;
   }

   .form-content {
     padding: 30px;
   }

   .form-section {
     margin-bottom: 30px;
     border-radius: 12px;
     overflow: hidden;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
   }

   .section-header {
     padding: 16px 20px;
     background: #f8f9fa;
     border-bottom: 1px solid #eef2f7;
     font-weight: 600;
     color: #2c3e50;
     display: flex;
     align-items: center;
     gap: 10px;
   }

   .section-header i {
     color: #3498db;
   }

   .section-content {
     padding: 20px;
     background: white;
   }

   .form-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
     gap: 20px;
   }

   .form-field {
     position: relative;
   }

   .form-label {
     display: block;
     margin-bottom: 8px;
     font-weight: 500;
     color: #2c3e50;
     font-size: 14px;
     text-transform: uppercase;
     letter-spacing: 0.5px;
   }

   .form-input,
   .form-select {
     width: 100%;
     padding: 14px 16px;
     border: 2px solid #eef2f7;
     border-radius: 10px;
     font-size: 15px;
     font-weight: 500;
     color: #2c3e50;
     background: #fafbfc;
     transition: all 0.3s ease;
   }

   .form-input:focus,
   .form-select:focus {
     outline: none;
     border-color: #3498db;
     background: white;
     box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
   }

   .form-input::placeholder {
     color: #a0a0a0;
   }

   .form-select {
     appearance: none;
     background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e');
     background-repeat: no-repeat;
     background-position: right 16px center;
     background-size: 16px;
   }

   .form-footer {
     display: flex;
     justify-content: flex-end;
     padding: 20px 30px;
     background: #f8f9fa;
     border-top: 1px solid #eef2f7;
   }

   .submit-button {
     padding: 14px 28px;
     background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
     color: white;
     border: none;
     border-radius: 10px;
     font-size: 15px;
     font-weight: 600;
     cursor: pointer;
     transition: all 0.3s ease;
     display: flex;
     align-items: center;
     gap: 8px;
     box-shadow: 0 4px 10px rgba(46, 204, 113, 0.25);
   }

   .submit-button:hover {
     transform: translateY(-2px);
     box-shadow: 0 6px 15px rgba(46, 204, 113, 0.3);
   }

   .submit-button:active {
     transform: translateY(0);
   }

   .clear-button {
     margin-top: 10px;
     padding: 8px 16px;
     background: #ff4d4f;
     color: white;
     border: none;
     border-radius: 8px;
     cursor: pointer;
   }

   .clear-button:hover {
     background: #d9363e;
   }

   .profile-picture-preview {
     max-width: 150px;
     max-height: 150px;
     border-radius: 50%;
     margin-bottom: 10px;
     object-fit: cover;
   }

   @media (max-width: 768px) {
     .form-grid {
       grid-template-columns: 1fr;
     }

     .form-header,
     .form-content {
       padding: 20px;
     }

     .form-footer {
       padding: 15px 20px;
     }
   }

   .animation-fade-in {
     animation: fadeIn 0.5s ease forwards;
   }

   @keyframes fadeIn {
     from {
       opacity: 0;
       transform: translateY(10px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }
   </style>
   