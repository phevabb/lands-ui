<template>
  <div class="staff-details-container">
    <div class="header">
      <h1>Staff Details</h1>
      <div class="actions">
        <button class="btn btn-outline" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back to List
        </button>
        <button class="btn btn-primary">
          <i class="fas fa-edit"></i> Edit Profile
        </button>
      </div>
    </div>

    <div class="profile-container">
      <div class="profile-card">
        <img :src="staff.photo" :alt="staff.full_name" class="profile-image" />
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
            <div class="stat-value">{{ staff.current_grade }}</div>
            <div class="stat-label">Grade</div>
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
        </div>
      </div>

      <div class="details-section">
        <!-- Personal Info -->
        <div class="details-card">
          <div class="card-header">
            Personal Information
            <span class="edit">Edit</span>
          </div>
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
          <div class="card-header">
            Employment Details
            <span class="edit">Edit</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Directorate</div>
              <div class="info-value">{{ staff.directorate }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Category</div>
              <div class="info-value">{{ staff.category }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Supervisor</div>
              <div class="info-value">{{ staff.supervisor_name || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of First Appointment</div>
              <div class="info-value">{{ formatDate(staff.date_of_first_appointment) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of Last Promotion</div>
              <div class="info-value">{{ formatDate(staff.date_of_last_promotion) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Years in Service</div>
              <div class="info-value">{{ staff.number_of_years_in_service }} years</div>
            </div>
          </div>
        </div>

        <!-- Compensation -->
        <div class="details-card">
          <div class="card-header">
            Compensation & Benefits
            <span class="edit">Edit</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Current Salary Level</div>
              <div class="info-value">{{ staff.current_salary_level }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Current Salary Point</div>
              <div class="info-value">{{ staff.current_salary_point }}</div>
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
              <div class="info-value">{{ staff.bank_name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Account Number</div>
              <div class="info-value">{{ staff.bank_account_number }}</div>
            </div>
          </div>
        </div>

        <!-- Additional -->
        <div class="details-card">
          <div class="card-header">
            Additional Information
            <span class="edit">Edit</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Academic Qualification</div>
              <div class="info-value">{{ staff.academic_qualification || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Professional Qualification</div>
              <div class="info-value">{{ staff.professional_qualification || 'Not specified' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">SSNIT Number</div>
              <div class="info-value">{{ staff.social_security_number }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">NHIS Number</div>
              <div class="info-value">{{ staff.national_health_insurance_number }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Payroll Status</div>
              <div class="info-value">
                <span class="badge" :class="getStatusClass(staff.payroll_status)">
                  {{ staff.payroll_status }}
                </span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Accommodation Status</div>
              <div class="info-value">{{ staff.accommodation_status }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router/composables";
import { get_user_details } from "../../services/api";

const user = ref(null);
const route = useRoute();

const fetchUserDetails = async () => {
  const id_user = route.params.id;
  const res = await get_user_details(id_user);
  user.value = res.data;
  console.log("okay, here we are.. detail table,:", res.data);
};

onMounted(fetchUserDetails);

// Dummy staff data (replace with API call later)
const staff = computed(() => ({

    id: 22,
  full_name: user.value?.full_name || "",
  directorate: user.value?.directorate || "-",
  category: user.value?.category || "-",

  district: user.value?.district || "-",
  region: user.value?.region || "-",
  email: user.value?.email || "-",
  user_id: user.value?.user_id || "-",
  title: user.value?.title || "-",
  gender: user.value?.gender || "-",
  date_of_birth: user.value?.date_of_birth || "-",
  age: user.value?.age || "-",
  marital_status: user.value?.marital_status || "-",
  current_salary_level: user.value?.current_salary_level || "-",
  current_salary_point: user.value?.current_salary_point || "-",
  date_of_first_appointment: user.value?.date_of_first_appointment || "-",
  date_of_last_promotion: user.value?.date_of_last_promotion || "-",
  number_of_years_in_service: user.value?.number_of_years_in_service || "-",
  academic_qualification: user.value?.academic_qualificationy || "-",
  professional_qualification: user.value?.professional_qualification || "-",
  monthly_gross_pay: user.value?.monthly_gross_pay || "-",
  annual_salary: user.value?.category || "-",
  phone_number: user.value?.phone_number || "-",
  ghana_card_number: user.value?.ghana_card_number || "-",
  social_security_number: user.value?.social_security_number || "-",

  national_health_insurance_number: user.value?.national_health_insurance_number || "-",
  bank_name: user.value?.category || "-",
  bank_account_number: user.value?.bank_account_number || "-",
  payroll_status: user.value?.payroll_status || "-",
  accommodation_status: user.value?.accommodation_status|| "-",
  supervisor_name: user.value?.supervisor_name || "-",
  current_grade: user.value?.current_grade || "-",
  photo:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"



}));


const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const formatCurrency = (amount) => {
  if (!amount) return "0.00";
  return parseFloat(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const getStatusClass = (status) => {
  if (status && status.includes("ACTIVE")) return "badge-success";
  if (status && status.includes("LEAVE")) return "badge-warning";
  return "badge-info";
};

const goBack = () => {
  console.log("Navigate back to staff list");
  // In a real app, use router.go(-1) or router.push()
};
</script>

<style scoped>
/* Keep your styles unchanged — pasted from original */
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
