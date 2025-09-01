
import { options } from './pages/options';
import axios from 'axios';

export async function loadDynamicOptions() {
    try {
        const [regionsRes, districtsRes, departmentsRes, classesRes, managementUnitsRes, currentGradesRes, changeOfGradesRes] = await Promise.all([
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
