import axios from 'axios';

// Static + dynamic options object
export const options = {
    directorates: [], // to be populated from API
    categories: [],
    districts: [],
    regions: [],
    current_gradee: [],
    next_gradee: [],
    change_of_gradee: [],
    management_unitt: [],

    TITLE_CHOICES: [
        ['Esq.', 'Esq.'],
        ['Mr.', 'Mr.'],
        ['Mrs.', 'Mrs.'],
        ['Ms.', 'Ms.'],
    ],

    ON_LEAVE_TYPE_CHOICES: [
        ['NO', 'NO'],
        ['STUDY LEAVE WITH PAY', 'STUDY LEAVE WITH PAY'],
        ['STUDY LEAVE WITHOUT PAY', 'STUDY LEAVE WITHOUT PAY'],
    ],

    ROLE_CHOICES: [
        ['Admin', "Admin"],
        ['Manager', "Manager"],
        ["Staff", "Staff"],
    ],

    PROFESSIONAL_CHOICES: [
        ['PROFESSIONAL', "PROFESSIONAL"],
        ['SUB PROFESSIONAL', "SUB PROFESSIONAL"],
    ],

    GENDER_CHOICES: [
        ['Male', "Male"],
        ['Female', "Female"],
    ],

    STAFF_CHOICES: [
        ['SENIOR STAFF', "SENIOR STAFF"],
        ['JUNIOR STAFF', "JUNIOR STAFF"],
    ],

    MARITAL_STATUS_CHOICES: [
        ['Single', 'Single'],
        ['Married', 'Married'],
    ],

    CHANGE_OF_GRADE_CHOICES: [
        ['First Appointment', 'First Appointment'],
        ['High Academic Qualification', 'High Academic Qualification'],
        ['Letter Of Appointment', 'Letter Of Appointment'],
        ['None', 'None'],
        ['Promotion', 'Promotion'],
        ['Regrading (Conversion/Upgrading)', 'Regrading (Conversion/Upgrading)'],
    ],

    CONTRACT_FULLTIME: [
        ['FULLTIME', 'FULLTIME'],
        ['CONTRACT', 'CONTRACT'],
    ],

    ACCOMMODATION_STATUS_CHOICES: [
        ['PERSONAL', 'PERSONAL'],
        ['RENTED', 'RENTED'],
        ['OFFICIAL RESIDENCE - OASL', 'OFFICIAL RESIDENCE - OASL'],
        ['OFFICIAL RESIDENCE - GoG', 'OFFICIAL RESIDENCE - GoG'],
    ],
};

// Function to load dynamic options from API
export async function loadDynamicOptions() {
    try {
        const [
            regionsRes,
            districtsRes,
            departmentsRes,
            classesRes,
            managementUnitsRes,
            currentGradesRes,
            changeOfGradesRes
        ] = await Promise.all([
            axios.get('http://127.0.0.1:8000/superadmin/api/v1/regions'),
            axios.get('http://127.0.0.1:8000/superadmin/api/v1/districts'),
            axios.get('http://127.0.0.1:8000/superadmin/api/v1/departments'),
            axios.get('http://127.0.0.1:8000/superadmin/api/v1/classes'),
            axios.get('http://127.0.0.1:8000/superadmin/api/v1/management-units'),
            axios.get('http://127.0.0.1:8000/superadmin/api/v1/current-grades'),
            axios.get('http://127.0.0.1:8000/superadmin/api/v1/change-of-grades')
        ]);

        options.regions = regionsRes.data.map(r => [r.id, r.region]);
        options.districts = districtsRes.data.map(d => [d.id, d.district]);
        options.directorates = departmentsRes.data.map(d => [d.id, d.department_name]);
        options.categories = classesRes.data.map(c => [c.id, c.classes_name]);
        options.management_unitt = managementUnitsRes.data.map(m => [m.id, m.management_unit_name]);
        options.current_gradee = currentGradesRes.data.map(g => [g.id, g.current_grade]);
        options.change_of_gradee = changeOfGradesRes.data.map(g => [g.id, g.grade]);

        console.log('Dynamic options loaded', options);
    } catch (error) {
        console.error('Error loading dynamic options:', error);
    }
}
