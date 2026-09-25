<template>
  <div class="staff-details-container">
    <div class="header">
      <h1>Staff Details</h1>
      
      <div class="actions">
        <button class="btn btn-danger" @click="openRemoveModal">
          <i class="fas fa-user-times"></i> Remove Staff
        </button>
        <button class="btn btn-outline" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back to List
        </button>
        <button class="btn btn-primary" @click="editStaff">
          <i class="fas fa-edit"></i> Edit Profile
        </button>
      </div>

      <!-- Remove Modal -->
      <div v-if="showRemoveModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 2000;">
        <div style="background: white; padding: 20px; border-radius: 8px; width: 400px; max-width: 90%; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
          <h3 style="margin-top: 0; font-size: 1.5em;">Remove Staff</h3>
          <p>Please select a reason for removing this staff member:</p>
          <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 10px;">
              <input type="radio" v-model="reason" value="Resigned" style="margin-right: 5px;">
              Resigned
            </label>
            <label style="display: block; margin-bottom: 10px;">
              <input type="radio" v-model="reason" value="Retired" style="margin-right: 5px;">
              Retired
            </label>
            <label style="display: block; margin-bottom: 10px;">
              <input type="radio" v-model="reason" value="Terminated" style="margin-right: 5px;">
              Terminated
            </label>
            <label style="display: block; margin-bottom: 10px;">
              <input type="radio" v-model="reason" value="Other" style="margin-right: 5px;">
              Other
            </label>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button class="btn btn-outline" @click="showRemoveModal = false" style="padding: 8px 16px;">Cancel</button>
            <button class="btn btn-danger" @click="removeUser" :disabled="!reason" style="padding: 8px 16px;">Confirm</button>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-container">
      <div class="profile-card">
        <img
          :src="getProfilePictureSrc(staff.profile_picture)"
          :alt="staff.full_name || 'Profile Image'"
          class="profile-image"
          @error="handleImageError"
        /> 

        <h2 class="profile-name">{{ staff.title }} {{ staff.full_name }}</h2>
        <p class="profile-title">Staff ID: {{ staff.user_id }}</p>
        <span class="profile-department">{{ staff.directorate }}</span>

        <div class="profile-stats">
          <div class="stat">
            <div class="stat-value">{{ staff.age }}</div>
            <div class="stat-label">Age</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ staff.number_of_years_in_service }}</div>
            <div class="stat-label">Years in Service</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ formatDate(staff.date_of_retirement) }}</div>
            <div class="stat-label">Retirement Date</div>
          </div>
        </div>

        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div>{{ staff.email || 'No email provided' }}</div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="fas fa-phone"></i>
            </div>
            <div>{{ staff.phone_number || 'No phone provided' }}</div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div>{{ staff.district }}, {{ staff.region }}</div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="fas fa-building"></i>
            </div>
            <div>{{ staff.management_unit_cost_centre }}</div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="fas fa-user-tie"></i>
            </div>
            <div>{{ staff.professional }}</div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="fas fa-user-tag"></i>
            </div>
            <div>{{ staff.role }}</div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="fas fa-users"></i>
            </div>
            <div>{{ staff.staff_category }}</div>
          </div>
        </div>
      </div>

      <div class="details-section">
        <!-- Personal Info -->
        <div class="details-card">
          <div class="card-header">Personal Information</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Full Name</div>
              <div class="info-value">{{ staff.title }} {{ staff.full_name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Staff ID</div>
              <div class="info-value">{{ staff.user_id }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of Birth</div>
              <div class="info-value">{{ formatDate(staff.date_of_birth) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Gender</div>
              <div class="info-value">{{ staff.gender }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Ghana Card Number</div>
              <div class="info-value">{{ staff.ghana_card_number }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Marital Status</div>
              <div class="info-value">{{ staff.marital_status }}</div>
            </div>
          </div>
        </div>

        <!-- Employment -->
        <div class="details-card">
          <div class="card-header">Employment Details</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Directorate</div>
              <div class="info-value">{{ staff.directorate }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Class</div>
              <div class="info-value">{{ staff.category }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Supervisor</div>
              <div class="info-value">{{ staff.supervisor_name || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Substantive Date</div>
              <div class="info-value">{{ formatDate(staff.substantive_date) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date Of First Appointment</div>
              <div class="info-value">{{ formatDate(staff.date_of_first_appointment) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Notional Effective Date</div>
              <div class="info-value">{{ formatDate(staff.national_effective_date) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date Of Assumption Of Duty</div>
              <div class="info-value">{{ formatDate(staff.date_of_assumption_of_duty) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date Of Last Promotion</div>
              <div class="info-value">{{ formatDate(staff.date_of_last_promotion) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Years In Service</div>
              <div class="info-value">{{ staff.number_of_years_in_service }} years</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fulltime / Contract</div>
              <div class="info-value">{{ staff.fulltime_contract_staff }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Change Of Grade</div>
              <div class="info-value">{{ staff.change_of_grade || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Current Grade</div>
              <div class="info-value">{{ staff.current_grade || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Years On Current Grade</div>
              <div class="info-value">{{ staff.years_on_current_grade || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Next Grade</div>
              <div class="info-value">{{ staff.next_grade || 'Not specified' }}</div>
            </div>
          </div>
        </div>

        <!-- Compensation -->
        <div class="details-card">
          <div class="card-header">Compensation & Benefits</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Single Spine</div>
              <div class="info-value">{{ staff.single_spine_monthly_salary || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Current Salary Level</div>
              <div class="info-value">{{ staff.current_salary_level || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Next Salary Level</div>
              <div class="info-value">{{ staff.next_salary_level || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Current Salary Point</div>
              <div class="info-value">{{ staff.current_salary_point || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Monthly Gross Pay</div>
              <div class="info-value">GHS {{ formatCurrency(staff.monthly_gross_pay) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Annual Salary</div>
              <div class="info-value">GHS {{ formatCurrency(staff.annual_salary) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Bank Name</div>
              <div class="info-value">{{ staff.bank_name || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Bank Branch</div>
              <div class="info-value">{{ staff.bank_account_branch || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Account Number</div>
              <div class="info-value">{{ staff.bank_account_number || 'Not specified' }}</div>
            </div>
          </div>
        </div>

        <!-- Additional -->
        <div class="details-card">
          <div class="card-header">Additional Information</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Number Targets</div>
              <div class="info-value">{{ staff.number_of_targets || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Number Targets Met</div>
              <div class="info-value">{{ staff.number_of_targets_met || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Number Of Targets Not Met</div>
              <div class="info-value">{{ staff.number_of_targets_not_met || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Number Of Focus Areas</div>
              <div class="info-value">{{ staff.number_of_focus_areas || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Self Assessment Description</div>
              <div class="info-value">{{ staff.self_assessment_description || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Overall Assessment Score</div>
              <div class="info-value">{{ staff.overall_assessment_score || 'Not specified' }}</div>
            </div>
            <div class="info-item" style="margin-bottom: 12px; display:flex; flex-direction:column;">
              <div class="info-label" style="font-weight:600; color:#2b2b2b; margin-bottom:6px;">
                Academic Qualifications
              </div>
              <div class="info-value" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <template v-if="staff.academic_qualifications && staff.academic_qualifications.length">
                  <span
                    v-for="qual in staff.academic_qualifications"
                    :key="qual.id"
                    :title="qual.name"
                    style="
                      display:inline-block;
                      padding:6px 10px;
                      background:linear-gradient(180deg, #ffffff, #f3f7ff);
                      border:1px solid rgba(25, 112, 255, 0.12);
                      color:#10307a;
                      font-size:13px;
                      border-radius:14px;
                      box-shadow:0 1px 2px rgba(16,48,122,0.06);
                      white-space:nowrap;
                    "
                  >
                    {{ qual.name }}
                  </span>
                </template>
                <template v-else>
                  <span style="color:#6b7280; font-size:14px;">Not specified</span>
                </template>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">SSNIT Number</div>
              <div class="info-value">{{ staff.social_security_number || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">NHIS Number</div>
              <div class="info-value">{{ staff.national_health_insurance_number || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Payroll Status</div>
              <div class="info-value">
                <span class="badge" :class="getStatusClass(staff.payroll_status)">
                  {{ staff.payroll_status || 'Not specified' }}
                </span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Accommodation Status</div>
              <div class="info-value">{{ staff.accommodation_status || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">At POST / On Leave</div>
              <div class="info-value">{{ staff.at_post_on_leave || 'Not specified' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';
import axios from 'axios';
import Swal from 'sweetalert2';
import { get_user_details, remove_user, DEFAULT_AVATAR } from '@/services/api';

// Initialize refs
const user = ref(null);
const route = useRoute();
const router = useRouter();
const showRemoveModal = ref(false);
const reason = ref('');


// Handle image loading errors
const handleImageError = (event) => {
  event.target.src = DEFAULT_AVATAR; // Fallback to default avatar
};

// Construct profile picture URL
const getProfilePictureSrc = (profilePicture) => {
  if (profilePicture && profilePicture !== '-') {
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return `${api.defaults.baseURL}/${profilePicture.replace(/^\/+/, '')}`;
  }
  return DEFAULT_AVATAR;
};


// Open the remove modal
const openRemoveModal = () => {
  reason.value = ''; // Reset reason when opening modal
  showRemoveModal.value = true;
};

// Remove user with selected reason


const removeUser = async () => {
  const id_user = route.params.id;

  try {
    const res = await remove_user({
      user_id: id_user,
      reason: reason.value,
    });

    if (res.status === 200) {
  Swal.fire({
    icon: "success",
    title: "User Removed",
    text: `Reason: ${reason.value}`,
    timer: 2000,
    showConfirmButton: false,
  });

  showRemoveModal.value = false;

  // wait 2 seconds (same as Swal timer) before redirect
  setTimeout(() => {
    router.push("/allusers");
  }, 2000);
}

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Failed",
      text: "Failed to remove user. Please try again.",
    });
  }
};


// Fetch user details from API
const fetchUserDetails = async () => {
  try {
    console.log("Fetching user details for ID:", route.params.id);
    const id_user = route.params.id;
    const res = await get_user_details(id_user);

    console.log("User details fetched: print", res.data);
    user.value = res.data;
  } catch (error) {

  }
};

// Navigate to edit page
const editStaff = () => {
  router.push({ name: 'Staff Update', params: { id: user.value?.id } });
};

// Navigate back to list
const goBack = () => {
  router.push('/allusers');
};

onMounted(fetchUserDetails);

// Computed property for staff details


const staff = computed(() => {
  const account =
    user.value || {};

  return {
    id:
      account.id ?? null,

    profilePictureUrl:
      account.profilePictureUrl ||
      DEFAULT_AVATAR,

    profilePicturePublicId:
      account.profilePicturePublicId ||
      null,

    userId:
      account.userId ||
      "Not specified",

    firstName:
      account.firstName ||
      "Not specified",

    middleName:
      account.middleName ||
      "Not specified",

    lastName:
      account.lastName ||
      "Not specified",

    maidenName:
      account.maidenName ||
      "Not specified",

    fullName:
      account.fullName ||
      account.displayName ||
      "Not specified",

    displayName:
      account.displayName ||
      account.fullName ||
      account.userId ||
      "Not specified",

    role:
      account.role ||
      "Not specified",

    isActive:
      account.isActive ?? false,

    isStaff:
      account.isStaff ?? false,

    isSuperuser:
      account.isSuperuser ?? false,

    gender:
      account.gender ||
      "Not specified",

    dateOfBirth:
      account.dateOfBirth ||
      "Not specified",

    standardRetirementAge:
      account.standardRetirementAge ??
      "Not specified",

    maritalStatus:
      account.maritalStatus ||
      "Not specified",

    professional:
      account.professional ||
      "Not specified",

    professionalQualification:
      account.professionalQualification ||
      "Not specified",

    staffCategory:
      account.staffCategory ||
      "Not specified",

    fulltimeContractStaff:
      account.fulltimeContractStaff ||
      "Not specified",

    atPostOnLeave:
      account.atPostOnLeave ||
      "Not specified",

    regionId:
      account.regionId ?? null,

    regionName:
      account.regionName ||
      "Not specified",

    districtId:
      account.districtId ?? null,

    districtName:
      account.districtName ||
      "Not specified",

    directorateId:
      account.directorateId ?? null,

    directorateName:
      account.directorateName ||
      "Not specified",

    categoryId:
      account.categoryId ?? null,

    categoryName:
      account.categoryName ||
      "Not specified",

    managementUnitCostCentreId:
      account.managementUnitCostCentreId ??
      null,

    managementUnitCostCentreName:
      account.managementUnitCostCentreName ||
      "Not specified",

    currentGradeId:
      account.currentGradeId ?? null,

    currentGradeName:
      account.currentGradeName ||
      "Not specified",

    nextGradeId:
      account.nextGradeId ?? null,

    nextGradeName:
      account.nextGradeName ||
      "Not specified",

    changeOfGradeId:
      account.changeOfGradeId ?? null,

    changeOfGradeName:
      account.changeOfGradeName ||
      "Not specified",

    titleId:
      account.titleId ?? null,

    titleName:
      account.titleName ||
      "Not specified",

    onLeaveTypeId:
      account.onLeaveTypeId ?? null,

    onLeaveTypeName:
      account.onLeaveTypeName ||
      "Not specified",

    dateOfAssumptionOfDuty:
      account.dateOfAssumptionOfDuty ||
      "Not specified",

    substantiveDate:
      account.substantiveDate ||
      "Not specified",

    nationalEffectiveDate:
      account.nationalEffectiveDate ||
      "Not specified",

    dateOfFirstAppointment:
      account.dateOfFirstAppointment ||
      "Not specified",

    dateOfLastPromotion:
      account.dateOfLastPromotion ||
      "Not specified",

    currentSalaryLevel:
      account.currentSalaryLevel ||
      "Not specified",

    currentSalaryPoint:
      account.currentSalaryPoint ||
      "Not specified",

    nextSalaryLevel:
      account.nextSalaryLevel ||
      "Not specified",

    singleSpineMonthlySalary:
      account.singleSpineMonthlySalary ??
      "0.00",

    monthlyGrossPay:
      account.monthlyGrossPay ??
      "0.00",

    annualSalary:
      account.annualSalary ??
      "0.00",

    numberOfFocusAreas:
      account.numberOfFocusAreas ??
      "Not specified",

    numberOfTargets:
      account.numberOfTargets ??
      "Not specified",

    numberOfTargetsMet:
      account.numberOfTargetsMet ??
      "Not specified",

    numberOfTargetsNotMet:
      account.numberOfTargetsNotMet ??
      "Not specified",

    overallAssessmentScore:
      account.overallAssessmentScore ??
      "Not specified",

    selfAssessmentDescription:
      account.selfAssessmentDescription ||
      "Not specified",

    phoneNumber:
      account.phoneNumber ||
      "No phone number provided",

    ghanaCardNumber:
      account.ghanaCardNumber ||
      "Not specified",

    socialSecurityNumber:
      account.socialSecurityNumber ||
      "Not specified",

    nationalHealthInsuranceNumber:
      account.nationalHealthInsuranceNumber ||
      "Not specified",

    bankName:
      account.bankName ||
      "Not specified",

    bankAccountBranch:
      account.bankAccountBranch ||
      "Not specified",

    bankAccountNumber:
      account.bankAccountNumber ||
      "Not specified",

    payrollStatus:
      account.payrollStatus ||
      "Not specified",

    accommodationStatus:
      account.accommodationStatus ||
      "Not specified",

    supervisorName:
      account.supervisorName ||
      "Not specified",

    academicQualification:
      account.academicQualification ||
      null,

    academicQualificationName:
      account.academicQualification?.name ||
      "Not specified",

    dateJoined:
      account.dateJoined ||
      "Not specified",

    lastLogin:
      account.lastLogin ||
      "Not specified"
  };
});





// Format academic qualifications as a comma-separated list
const formatQualifications = (qualifications) => {
  if (!qualifications || !Array.isArray(qualifications) || qualifications.length === 0) {
    return 'Not specified';
  }
  return qualifications
    .map((q) => q.name || 'Unknown')
    .filter((name) => name !== 'Unknown')
    .join(', ');
};

// Format date
const formatDate = (dateString) => {
  if (!dateString || dateString === 'Not specified') return 'Not specified';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format currency
const formatCurrency = (amount) => {
  if (!amount || amount === 'Not specified' || amount === '0.00') return '0.00';
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Get status class for badge
const getStatusClass = (status) => {
  if (status && status.includes('ACTIVE')) return 'badge-success';
  if (status && status.includes('LEAVE')) return 'badge-warning';
  return 'badge-info';
};
</script>


<style scoped>
.staff-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e1e4e8;
}
.profile-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #ccc;
}
.header h1 {
  font-weight: 600;
  color: #2c3e50;
}
.actions {
  display: flex;
  gap: 10px;
}
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-primary {
  background-color: #3498db;
  color: white;
}
.btn-primary:hover {
  background-color: #2980b9;
}
.btn-outline {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #7f8c8d;
}
.btn-outline:hover {
  background-color: #f8f9fa;
}
.profile-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
}
.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  text-align: center;
}
.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 20px;
  border: 4px solid #e1e4e8;
}
.profile-name {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3e50;
}
.profile-title {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-size: 16px;
}
.profile-department {
  display: inline-block;
  background-color: #e1f0ff;
  color: #3498db;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}
.profile-stats {
  display: flex;
  justify-content: space-around;
  margin: 25px 0;
  padding: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}
.stat {
  text-align: center;
}
.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}
.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}
.contact-info {
  text-align: left;
  margin-top: 20px;
}
.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #555;
}
.contact-icon {
  width: 36px;
  height: 36px;
  background-color: #f5f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #3498db;
}
.details-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-bottom: 30px;
}
.card-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header .edit {
  color: #3498db;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.info-item {
  margin-bottom: 15px;
}
.info-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}
.info-value {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}
.badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.badge-success {
  background-color: #e6f7ee;
  color: #2ecc71;
}
.badge-warning {
  background-color: #fef5e6;
  color: #f39c12;
}
.badge-info {
  background-color: #e6f4ff;
  color: #3498db;
}
@media (max-width: 900px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>