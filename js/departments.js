
// let allDepartments = [];
// let allEmployees = [];

// let selectedDepartmentId = null;
// let isEditMode = false;


// // ======================================================
// // INITIALIZE
// // ======================================================

// document.addEventListener("DOMContentLoaded", async function () {

//     if (!requireAuth()) {
//         return;
//     }

//     loadCurrentUser();
//     setCurrentDate();

//     setupEventListeners();

//     await loadPageData();

// });


// // ======================================================
// // LOAD PAGE DATA
// // ======================================================

// async function loadPageData() {

//     showLoading();
//     hideError();

//     try {

//         /*
//          * We load both departments and employees.
//          *
//          * Department API gives us:
//          *     id
//          *     name
//          *     created_at
//          *
//          * Employee API lets us calculate:
//          *     employees per department
//          *     assigned employees
//          *     unassigned employees
//          */

//         const results = await Promise.all([
//             getDepartments(),
//             getEmployees()
//         ]);

//         const departmentResponse = results[0];
//         const employeeResponse = results[1];


//         // -----------------------------
//         // Normalize departments
//         // -----------------------------

//         if (Array.isArray(departmentResponse)) {

//             allDepartments = departmentResponse;

//         } else if (
//             departmentResponse &&
//             Array.isArray(departmentResponse.departments)
//         ) {

//             allDepartments =
//                 departmentResponse.departments;

//         } else if (
//             departmentResponse &&
//             Array.isArray(departmentResponse.records)
//         ) {

//             allDepartments =
//                 departmentResponse.records;

//         } else {

//             allDepartments = [];

//         }


//         // -----------------------------
//         // Normalize employees
//         // -----------------------------

//         if (Array.isArray(employeeResponse)) {

//             allEmployees = employeeResponse;

//         } else if (
//             employeeResponse &&
//             Array.isArray(employeeResponse.employees)
//         ) {

//             allEmployees =
//                 employeeResponse.employees;

//         } else if (
//             employeeResponse &&
//             Array.isArray(employeeResponse.records)
//         ) {

//             allEmployees =
//                 employeeResponse.records;

//         } else {

//             allEmployees = [];

//         }


//         updateSummary();
//         renderDepartments();

//         showTable();

//     } catch (error) {

//         console.error(
//             "Failed to load department page:",
//             error
//         );

//         showError(
//             getErrorMessage(
//                 error,
//                 "Unable to load departments. Please try again."
//             )
//         );

//     }

// }


// // ======================================================
// // EVENT LISTENERS
// // ======================================================

// function setupEventListeners() {

//     // Add department

//     const addButton =
//         document.getElementById(
//             "addDepartmentButton"
//         );

//     if (addButton) {

//         addButton.addEventListener(
//             "click",
//             openAddDepartmentModal
//         );

//     }


//     // Empty state add button

//     const emptyAddButton =
//         document.getElementById(
//             "emptyAddDepartmentButton"
//         );

//     if (emptyAddButton) {

//         emptyAddButton.addEventListener(
//             "click",
//             openAddDepartmentModal
//         );

//     }


//     // Search

//     const searchInput =
//         document.getElementById(
//             "departmentSearch"
//         );

//     if (searchInput) {

//         searchInput.addEventListener(
//             "input",
//             function () {
//                 renderDepartments();
//             }
//         );

//     }


//     // Retry

//     const retryButton =
//         document.getElementById(
//             "retryDepartmentsButton"
//         );

//     if (retryButton) {

//         retryButton.addEventListener(
//             "click",
//             loadPageData
//         );

//     }


//     // Add/Edit form

//     const departmentForm =
//         document.getElementById(
//             "departmentForm"
//         );

//     if (departmentForm) {

//         departmentForm.addEventListener(
//             "submit",
//             handleDepartmentSubmit
//         );

//     }


//     // Close Add/Edit modal

//     const closeModalButton =
//         document.getElementById(
//             "closeDepartmentModal"
//         );

//     if (closeModalButton) {

//         closeModalButton.addEventListener(
//             "click",
//             closeDepartmentModal
//         );

//     }


//     const cancelDepartmentButton =
//         document.getElementById(
//             "cancelDepartmentButton"
//         );

//     if (cancelDepartmentButton) {

//         cancelDepartmentButton.addEventListener(
//             "click",
//             closeDepartmentModal
//         );

//     }


//     // Close delete modal

//     const cancelDeleteButton =
//         document.getElementById(
//             "cancelDeleteButton"
//         );

//     if (cancelDeleteButton) {

//         cancelDeleteButton.addEventListener(
//             "click",
//             closeDeleteDepartmentModal
//         );

//     }


//     // Confirm delete

//     const confirmDeleteButton =
//         document.getElementById(
//             "confirmDeleteButton"
//         );

//     if (confirmDeleteButton) {

//         confirmDeleteButton.addEventListener(
//             "click",
//             handleDeleteDepartment
//         );

//     }


//     // Logout

//     const logoutButton =
//         document.getElementById(
//             "logoutButton"
//         );

//     if (logoutButton) {

//         logoutButton.addEventListener(
//             "click",
//             function () {
//                 logout();
//             }
//         );

//     }


//     // Mobile menu

//     const mobileMenuButton =
//         document.getElementById(
//             "mobileMenuButton"
//         );

//     if (mobileMenuButton) {

//         mobileMenuButton.addEventListener(
//             "click",
//             function () {

//                 const sidebar =
//                     document.getElementById(
//                         "sidebar"
//                     );

//                 if (sidebar) {
//                     sidebar.classList.toggle(
//                         "mobile-open"
//                     );
//                 }

//             }
//         );

//     }


//     // Close modal by clicking outside

//     const departmentModal =
//         document.getElementById(
//             "departmentModal"
//         );

//     if (departmentModal) {

//         departmentModal.addEventListener(
//             "click",
//             function (event) {

//                 if (
//                     event.target ===
//                     departmentModal
//                 ) {
//                     closeDepartmentModal();
//                 }

//             }
//         );

//     }


//     const deleteModal =
//         document.getElementById(
//             "deleteDepartmentModal"
//         );

//     if (deleteModal) {

//         deleteModal.addEventListener(
//             "click",
//             function (event) {

//                 if (
//                     event.target ===
//                     deleteModal
//                 ) {
//                     closeDeleteDepartmentModal();
//                 }

//             }
//         );

//     }


//     // Escape key

//     document.addEventListener(
//         "keydown",
//         function (event) {

//             if (event.key !== "Escape") {
//                 return;
//             }

//             closeDepartmentModal();
//             closeDeleteDepartmentModal();

//         }
//     );

// }


// // ======================================================
// // SUMMARY
// // ======================================================

// function updateSummary() {

//     const totalDepartments =
//         allDepartments.length;


//     let assignedEmployees = 0;
//     let unassignedEmployees = 0;


//     allEmployees.forEach(function (employee) {

//         /*
//          * Only ACTIVE employees are considered
//          * for the current organization allocation.
//          */

//         const status =
//             String(
//                 employee.status || ""
//             ).toUpperCase();


//         if (status === "INACTIVE") {
//             return;
//         }


//         const departmentId =
//             employee.department_id ??
//             (
//                 employee.department
//                     ? employee.department.id
//                     : null
//             );


//         if (departmentId) {

//             assignedEmployees++;

//         } else {

//             unassignedEmployees++;

//         }

//     });


//     const totalElement =
//         document.getElementById(
//             "departmentTotal"
//         );

//     const assignedElement =
//         document.getElementById(
//             "assignedEmployees"
//         );

//     const unassignedElement =
//         document.getElementById(
//             "unassignedEmployees"
//         );


//     if (totalElement) {

//         totalElement.textContent =
//             totalDepartments;

//     }


//     if (assignedElement) {

//         assignedElement.textContent =
//             assignedEmployees;

//     }


//     if (unassignedElement) {

//         unassignedElement.textContent =
//             unassignedEmployees;

//     }

// }


// // ======================================================
// // RENDER DEPARTMENTS
// // ======================================================

// function renderDepartments() {

//     const tableBody =
//         document.getElementById(
//             "departmentsTableBody"
//         );

//     const emptyState =
//         document.getElementById(
//             "departmentEmpty"
//         );

//     if (!tableBody) {
//         return;
//     }


//     const searchInput =
//         document.getElementById(
//             "departmentSearch"
//         );


//     const searchTerm =
//         searchInput
//             ? searchInput.value
//                 .trim()
//                 .toLowerCase()
//             : "";


//     let filteredDepartments =
//         allDepartments;


//     if (searchTerm) {

//         filteredDepartments =
//             allDepartments.filter(
//                 function (department) {

//                     const name =
//                         String(
//                             department.name || ""
//                         ).toLowerCase();

//                     return name.includes(
//                         searchTerm
//                     );

//                 }
//             );

//     }


//     tableBody.innerHTML = "";


//     if (
//         filteredDepartments.length === 0
//     ) {

//         if (emptyState) {
//             emptyState.hidden = false;
//         }

//         return;

//     }


//     if (emptyState) {
//         emptyState.hidden = true;
//     }


//     filteredDepartments.forEach(
//         function (department) {

//             const row =
//                 document.createElement("tr");


//             const employeeCount =
//                 getDepartmentEmployeeCount(
//                     department.id
//                 );


//             const createdDate =
//                 formatDate(
//                     department.created_at
//                 );


//             const statusClass =
//                 employeeCount > 0
//                     ? "status-active"
//                     : "status-empty";


//             const statusText =
//                 employeeCount > 0
//                     ? "In Use"
//                     : "Empty";


//             row.innerHTML = `

//                 <td>

//                     <div class="department-name-cell">

//                         <div class="department-avatar">
//                             ${getDepartmentInitial(
//                                 department.name
//                             )}
//                         </div>

//                         <div>

//                             <strong>
//                                 ${escapeHtml(
//                                     department.name
//                                 )}
//                             </strong>

//                             <span>
//                                 Department
//                             </span>

//                         </div>

//                     </div>

//                 </td>


//                 <td>

//                     <span class="employee-count">
//                         ${employeeCount}
//                     </span>

//                 </td>


//                 <td>
//                     ${createdDate}
//                 </td>


//                 <td>

//                     <span class="status-badge ${statusClass}">

//                         <span class="status-dot"></span>

//                         ${statusText}

//                     </span>

//                 </td>


//                 <td>

//                     <div class="department-actions">

//                         <button
//                             type="button"
//                             class="table-action-button edit-action"
//                             data-action="edit"
//                             data-id="${department.id}"
//                         >
//                             Edit
//                         </button>


//                         <button
//                             type="button"
//                             class="table-action-button delete-action"
//                             data-action="delete"
//                             data-id="${department.id}"
//                         >
//                             Delete
//                         </button>

//                     </div>

//                 </td>

//             `;


//             tableBody.appendChild(row);

//         }
//     );


//     setupTableActions();

// }


// // ======================================================
// // DEPARTMENT EMPLOYEE COUNT
// // ======================================================

// function getDepartmentEmployeeCount(
//     departmentId
// ) {

//     let count = 0;


//     allEmployees.forEach(
//         function (employee) {

//             const status =
//                 String(
//                     employee.status || ""
//                 ).toUpperCase();


//             if (status === "INACTIVE") {
//                 return;
//             }


//             const employeeDepartmentId =
//                 employee.department_id ??
//                 (
//                     employee.department
//                         ? employee.department.id
//                         : null
//                 );


//             if (
//                 Number(employeeDepartmentId) ===
//                 Number(departmentId)
//             ) {

//                 count++;

//             }

//         }
//     );


//     return count;

// }


// // ======================================================
// // TABLE ACTIONS
// // ======================================================

// function setupTableActions() {

//     const editButtons =
//         document.querySelectorAll(
//             '[data-action="edit"]'
//         );


//     editButtons.forEach(
//         function (button) {

//             button.addEventListener(
//                 "click",
//                 function () {

//                     const id =
//                         Number(
//                             button.dataset.id
//                         );

//                     openEditDepartmentModal(
//                         id
//                     );

//                 }
//             );

//         }
//     );


//     const deleteButtons =
//         document.querySelectorAll(
//             '[data-action="delete"]'
//         );


//     deleteButtons.forEach(
//         function (button) {

//             button.addEventListener(
//                 "click",
//                 function () {

//                     const id =
//                         Number(
//                             button.dataset.id
//                         );

//                     openDeleteDepartmentModal(
//                         id
//                     );

//                 }
//             );

//         }
//     );

// }


// // ======================================================
// // ADD DEPARTMENT
// // ======================================================

// function openAddDepartmentModal() {

//     selectedDepartmentId = null;
//     isEditMode = false;


//     const modal =
//         document.getElementById(
//             "departmentModal"
//         );

//     const title =
//         document.getElementById(
//             "departmentModalTitle"
//         );

//     const description =
//         document.getElementById(
//             "departmentModalDescription"
//         );

//     const form =
//         document.getElementById(
//             "departmentForm"
//         );

//     const input =
//         document.getElementById(
//             "departmentName"
//         );


//     if (title) {
//         title.textContent =
//             "Add Department";
//     }


//     if (description) {
//         description.textContent =
//             "Create a new department.";
//     }


//     if (form) {
//         form.reset();
//     }


//     hideDepartmentFormError();


//     if (modal) {
//         modal.hidden = false;
//     }


//     if (input) {

//         setTimeout(
//             function () {
//                 input.focus();
//             },
//             100
//         );

//     }

// }


// // ======================================================
// // EDIT DEPARTMENT
// // ======================================================

// function openEditDepartmentModal(
//     departmentId
// ) {

//     const department =
//         allDepartments.find(
//             function (item) {

//                 return Number(item.id) ===
//                     Number(departmentId);

//             }
//         );


//     if (!department) {
//         return;
//     }


//     selectedDepartmentId =
//         Number(departmentId);

//     isEditMode = true;


//     const modal =
//         document.getElementById(
//             "departmentModal"
//         );

//     const title =
//         document.getElementById(
//             "departmentModalTitle"
//         );

//     const description =
//         document.getElementById(
//             "departmentModalDescription"
//         );

//     const input =
//         document.getElementById(
//             "departmentName"
//         );


//     if (title) {

//         title.textContent =
//             "Edit Department";

//     }


//     if (description) {

//         description.textContent =
//             "Update the department name.";

//     }


//     if (input) {

//         input.value =
//             department.name || "";

//     }


//     hideDepartmentFormError();


//     if (modal) {
//         modal.hidden = false;
//     }


//     if (input) {

//         setTimeout(
//             function () {

//                 input.focus();
//                 input.select();

//             },
//             100
//         );

//     }

// }


// // ======================================================
// // SUBMIT ADD / EDIT
// // ======================================================

// async function handleDepartmentSubmit(
//     event
// ) {

//     event.preventDefault();


//     const input =
//         document.getElementById(
//             "departmentName"
//         );

//     const saveButton =
//         document.getElementById(
//             "saveDepartmentButton"
//         );


//     const name =
//         input
//             ? input.value.trim()
//             : "";


//     hideDepartmentFormError();


//     // -----------------------------
//     // Validation
//     // -----------------------------

//     if (!name) {

//         showDepartmentFormError(
//             "Department name is required."
//         );

//         if (input) {
//             input.focus();
//         }

//         return;
//     }


//     if (name.length < 2) {

//         showDepartmentFormError(
//             "Department name must contain at least 2 characters."
//         );

//         if (input) {
//             input.focus();
//         }

//         return;
//     }


//     try {

//         if (saveButton) {
//             saveButton.disabled = true;
//         }


//         if (isEditMode) {

//             saveButton.textContent =
//                 "Updating...";


//             await updateDepartment(
//                 selectedDepartmentId,
//                 {
//                     name: name
//                 }
//             );

//         } else {

//             saveButton.textContent =
//                 "Saving...";


//             await createDepartment(
//                 {
//                     name: name
//                 }
//             );

//         }


//         closeDepartmentModal();

//         await loadPageData();


//     } catch (error) {

//         console.error(
//             "Department save failed:",
//             error
//         );


//         showDepartmentFormError(
//             getErrorMessage(
//                 error,
//                 "Unable to save department."
//             )
//         );


//     } finally {

//         if (saveButton) {

//             saveButton.disabled = false;

//             saveButton.textContent =
//                 isEditMode
//                     ? "Update Department"
//                     : "Save Department";

//         }

//     }

// }


// // ======================================================
// // DELETE DEPARTMENT
// // ======================================================

// function openDeleteDepartmentModal(
//     departmentId
// ) {

//     const department =
//         allDepartments.find(
//             function (item) {

//                 return Number(item.id) ===
//                     Number(departmentId);

//             }
//         );


//     if (!department) {
//         return;
//     }


//     selectedDepartmentId =
//         Number(departmentId);


//     const modal =
//         document.getElementById(
//             "deleteDepartmentModal"
//         );

//     const nameElement =
//         document.getElementById(
//             "deleteDepartmentName"
//         );


//     if (nameElement) {

//         nameElement.textContent =
//             department.name;

//     }


//     hideDeleteError();


//     if (modal) {
//         modal.hidden = false;
//     }

// }


// // ======================================================
// // CONFIRM DELETE
// // ======================================================

// async function handleDeleteDepartment() {

//     if (!selectedDepartmentId) {
//         return;
//     }


//     const deleteButton =
//         document.getElementById(
//             "confirmDeleteButton"
//         );


//     try {

//         if (deleteButton) {

//             deleteButton.disabled = true;

//             deleteButton.textContent =
//                 "Deleting...";

//         }


//         await deleteDepartment(
//             selectedDepartmentId
//         );


//         closeDeleteDepartmentModal();

//         await loadPageData();


//     } catch (error) {

//         console.error(
//             "Department deletion failed:",
//             error
//         );


//         showDeleteError(
//             getErrorMessage(
//                 error,
//                 "Unable to delete department."
//             )
//         );


//     } finally {

//         if (deleteButton) {

//             deleteButton.disabled = false;

//             deleteButton.textContent =
//                 "Delete Department";

//         }

//     }

// }


// // ======================================================
// // CLOSE ADD / EDIT MODAL
// // ======================================================

// function closeDepartmentModal() {

//     const modal =
//         document.getElementById(
//             "departmentModal"
//         );


//     if (modal) {
//         modal.hidden = true;
//     }


//     selectedDepartmentId = null;
//     isEditMode = false;


//     hideDepartmentFormError();

// }


// // ======================================================
// // CLOSE DELETE MODAL
// // ======================================================

// function closeDeleteDepartmentModal() {

//     const modal =
//         document.getElementById(
//             "deleteDepartmentModal"
//         );


//     if (modal) {
//         modal.hidden = true;
//     }


//     selectedDepartmentId = null;


//     hideDeleteError();

// }


// // ======================================================
// // FORM ERROR
// // ======================================================

// function showDepartmentFormError(
//     message
// ) {

//     const errorBox =
//         document.getElementById(
//             "departmentFormError"
//         );

//     const messageElement =
//         document.getElementById(
//             "departmentFormErrorMessage"
//         );


//     if (messageElement) {
//         messageElement.textContent =
//             message;
//     }


//     if (errorBox) {
//         errorBox.hidden = false;
//     }

// }


// function hideDepartmentFormError() {

//     const errorBox =
//         document.getElementById(
//             "departmentFormError"
//         );

//     const messageElement =
//         document.getElementById(
//             "departmentFormErrorMessage"
//         );


//     if (messageElement) {
//         messageElement.textContent = "";
//     }


//     if (errorBox) {
//         errorBox.hidden = true;
//     }

// }


// // ======================================================
// // DELETE ERROR
// // ======================================================

// function showDeleteError(message) {

//     const errorBox =
//         document.getElementById(
//             "deleteDepartmentError"
//         );

//     const messageElement =
//         document.getElementById(
//             "deleteDepartmentErrorMessage"
//         );


//     if (messageElement) {
//         messageElement.textContent =
//             message;
//     }


//     if (errorBox) {
//         errorBox.hidden = false;
//     }

// }


// function hideDeleteError() {

//     const errorBox =
//         document.getElementById(
//             "deleteDepartmentError"
//         );

//     const messageElement =
//         document.getElementById(
//             "deleteDepartmentErrorMessage"
//         );


//     if (messageElement) {
//         messageElement.textContent = "";
//     }


//     if (errorBox) {
//         errorBox.hidden = true;
//     }

// }


// // ======================================================
// // LOADING / ERROR STATES
// // ======================================================

// function showLoading() {

//     const loading =
//         document.getElementById(
//             "departmentLoading"
//         );

//     const table =
//         document.getElementById(
//             "departmentTableWrapper"
//         );

//     if (loading) {
//         loading.hidden = false;
//     }

//     if (table) {
//         table.hidden = true;
//     }

// }


// function showTable() {

//     const loading =
//         document.getElementById(
//             "departmentLoading"
//         );

//     const table =
//         document.getElementById(
//             "departmentTableWrapper"
//         );


//     if (loading) {
//         loading.hidden = true;
//     }

//     if (table) {
//         table.hidden = false;
//     }

// }


// function showError(message) {

//     const loading =
//         document.getElementById(
//             "departmentLoading"
//         );

//     const table =
//         document.getElementById(
//             "departmentTableWrapper"
//         );

//     const errorBox =
//         document.getElementById(
//             "departmentError"
//         );

//     const errorMessage =
//         document.getElementById(
//             "departmentErrorMessage"
//         );


//     if (loading) {
//         loading.hidden = true;
//     }

//     if (table) {
//         table.hidden = true;
//     }


//     if (errorMessage) {
//         errorMessage.textContent =
//             message;
//     }


//     if (errorBox) {
//         errorBox.hidden = false;
//     }

// }


// function hideError() {

//     const errorBox =
//         document.getElementById(
//             "departmentError"
//         );


//     if (errorBox) {
//         errorBox.hidden = true;
//     }

// }


// // ======================================================
// // CURRENT USER
// // ======================================================

// function loadCurrentUser() {

//     try {

//         const storedUser =
//             localStorage.getItem(
//                 APP_CONFIG.USER_KEY
//             );


//         if (!storedUser) {
//             return;
//         }


//         const user =
//             JSON.parse(storedUser);


//         const usernameElement =
//             document.getElementById(
//                 "currentUsername"
//             );


//         const avatarElement =
//             document.querySelector(
//                 ".admin-avatar"
//             );


//         if (usernameElement) {

//             usernameElement.textContent =
//                 user.username || "Admin";

//         }


//         if (avatarElement) {

//             avatarElement.textContent =
//                 getInitials(
//                     user.username || "Admin"
//                 );

//         }

//     } catch (error) {

//         console.error(
//             "Unable to load current user:",
//             error
//         );

//     }

// }


// // ======================================================
// // CURRENT DATE
// // ======================================================

// function setCurrentDate() {

//     const dateElement =
//         document.getElementById(
//             "currentDate"
//         );


//     if (!dateElement) {
//         return;
//     }


//     const now =
//         new Date();


//     dateElement.textContent =
//         now.toLocaleDateString(
//             "en-IN",
//             {
//                 weekday: "short",
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric"
//             }
//         );

// }


// // ======================================================
// // UTILITIES
// // ======================================================

// function getInitials(name) {

//     if (!name) {
//         return "A";
//     }


//     const parts =
//         name.trim().split(/\s+/);


//     if (parts.length === 1) {

//         return parts[0]
//             .charAt(0)
//             .toUpperCase();

//     }


//     return (
//         parts[0].charAt(0) +
//         parts[parts.length - 1].charAt(0)
//     ).toUpperCase();

// }


// function getDepartmentInitial(name) {

//     if (!name) {
//         return "D";
//     }


//     return name
//         .trim()
//         .charAt(0)
//         .toUpperCase();

// }


// function formatDate(value) {

//     if (!value) {
//         return "—";
//     }


//     const date =
//         new Date(value);


//     if (Number.isNaN(date.getTime())) {
//         return "—";
//     }


//     return date.toLocaleDateString(
//         "en-IN",
//         {
//             day: "2-digit",
//             month: "short",
//             year: "numeric"
//         }
//     );

// }


// function escapeHtml(value) {

//     if (
//         value === null ||
//         value === undefined
//     ) {
//         return "";
//     }


//     return String(value)
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#039;");

// }


// function getErrorMessage(
//     error,
//     fallback
// ) {

//     if (
//         error &&
//         typeof error.message === "string" &&
//         error.message.trim()
//     ) {

//         return error.message;

//     }


//     return fallback;

// }










/* =========================================================
   DEPARTMENTS PAGE
   ========================================================= */

let allDepartments = [];
let allEmployees = [];

let selectedDepartmentId = null;
let isEditMode = false;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    if (!requireAuth()) {
        return;
    }

    loadCurrentUser();
    setCurrentDate();
    setupEventListeners();

    await loadPageData();

});


/* =========================================================
   LOAD PAGE DATA
   ========================================================= */

async function loadPageData() {

    showLoading();
    hideError();

    try {

        /*
         * Departments are the primary data for this page.
         * Employees are loaded separately so that an employee
         * API problem does not prevent departments from showing.
         */

        let departmentResponse = null;

        try {

            departmentResponse =
                await getDepartments();

        } catch (error) {

            console.error(
                "Failed to load departments:",
                error
            );

            throw error;

        }


        /* -----------------------------------------------
           NORMALIZE DEPARTMENTS
           ----------------------------------------------- */

        if (Array.isArray(departmentResponse)) {

            allDepartments =
                departmentResponse;

        } else if (
            departmentResponse &&
            Array.isArray(
                departmentResponse.departments
            )
        ) {

            allDepartments =
                departmentResponse.departments;

        } else if (
            departmentResponse &&
            Array.isArray(
                departmentResponse.records
            )
        ) {

            allDepartments =
                departmentResponse.records;

        } else {

            allDepartments = [];

        }


        /* -----------------------------------------------
           LOAD EMPLOYEES
           ----------------------------------------------- */

        try {

            const employeeResponse =
                await getEmployees();


            if (Array.isArray(employeeResponse)) {

                allEmployees =
                    employeeResponse;

            } else if (
                employeeResponse &&
                Array.isArray(
                    employeeResponse.employees
                )
            ) {

                allEmployees =
                    employeeResponse.employees;

            } else if (
                employeeResponse &&
                Array.isArray(
                    employeeResponse.records
                )
            ) {

                allEmployees =
                    employeeResponse.records;

            } else {

                allEmployees = [];

            }

        } catch (employeeError) {

            /*
             * Department page can still function if
             * employee loading fails.
             */

            console.error(
                "Failed to load employees:",
                employeeError
            );

            allEmployees = [];

        }


        /* -----------------------------------------------
           UPDATE UI
           ----------------------------------------------- */

        updateSummary();

        renderDepartments();

        showTable();

    } catch (error) {

        console.error(
            "Failed to load department page:",
            error
        );

        showError(
            getErrorMessage(
                error,
                "Unable to load departments. Please try again."
            )
        );

    }

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {


    /* -----------------------------------------------
       ADD DEPARTMENT
       ----------------------------------------------- */

    const addButton =
        document.getElementById(
            "addDepartmentButton"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            openAddDepartmentModal
        );

    }


    /* -----------------------------------------------
       EMPTY STATE ADD BUTTON
       ----------------------------------------------- */

    const emptyAddButton =
        document.getElementById(
            "emptyAddDepartmentButton"
        );

    if (emptyAddButton) {

        emptyAddButton.addEventListener(
            "click",
            openAddDepartmentModal
        );

    }


    /* -----------------------------------------------
       SEARCH
       ----------------------------------------------- */

    const searchInput =
        document.getElementById(
            "departmentSearch"
        );

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                renderDepartments();

            }
        );

    }


    /* -----------------------------------------------
       RETRY
       ----------------------------------------------- */

    const retryButton =
        document.getElementById(
            "retryDepartmentsButton"
        );

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            function () {

                loadPageData();

            }
        );

    }


    /* -----------------------------------------------
       ADD / EDIT FORM
       ----------------------------------------------- */

    const departmentForm =
        document.getElementById(
            "departmentForm"
        );

    if (departmentForm) {

        departmentForm.addEventListener(
            "submit",
            handleDepartmentSubmit
        );

    }


    /* -----------------------------------------------
       CLOSE DEPARTMENT MODAL
       ----------------------------------------------- */

    const closeModalButton =
        document.getElementById(
            "closeDepartmentModal"
        );

    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            closeDepartmentModal
        );

    }


    const cancelDepartmentButton =
        document.getElementById(
            "cancelDepartmentButton"
        );

    if (cancelDepartmentButton) {

        cancelDepartmentButton.addEventListener(
            "click",
            closeDepartmentModal
        );

    }


    /* -----------------------------------------------
       CLOSE DELETE MODAL
       ----------------------------------------------- */

    const cancelDeleteButton =
        document.getElementById(
            "cancelDeleteButton"
        );

    if (cancelDeleteButton) {

        cancelDeleteButton.addEventListener(
            "click",
            closeDeleteDepartmentModal
        );

    }


    /* -----------------------------------------------
       CONFIRM DELETE
       ----------------------------------------------- */

    const confirmDeleteButton =
        document.getElementById(
            "confirmDeleteButton"
        );

    if (confirmDeleteButton) {

        confirmDeleteButton.addEventListener(
            "click",
            handleDeleteDepartment
        );

    }


    /* -----------------------------------------------
       LOGOUT
       ----------------------------------------------- */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                logout();

            }
        );

    }


    /* -----------------------------------------------
       MOBILE MENU
       ----------------------------------------------- */

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
            "click",
            function () {

                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );

                if (sidebar) {

                    sidebar.classList.toggle(
                        "mobile-open"
                    );

                }

            }
        );

    }


    /* -----------------------------------------------
       CLICK OUTSIDE ADD / EDIT MODAL
       ----------------------------------------------- */

    const departmentModal =
        document.getElementById(
            "departmentModal"
        );

    if (departmentModal) {

        departmentModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    departmentModal
                ) {

                    closeDepartmentModal();

                }

            }
        );

    }


    /* -----------------------------------------------
       CLICK OUTSIDE DELETE MODAL
       ----------------------------------------------- */

    const deleteModal =
        document.getElementById(
            "deleteDepartmentModal"
        );

    if (deleteModal) {

        deleteModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    deleteModal
                ) {

                    closeDeleteDepartmentModal();

                }

            }
        );

    }


    /* -----------------------------------------------
       ESCAPE KEY
       ----------------------------------------------- */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
                return;
            }

            closeDepartmentModal();
            closeDeleteDepartmentModal();

        }
    );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    const totalDepartments =
        allDepartments.length;


    let assignedEmployees = 0;
    let unassignedEmployees = 0;


    allEmployees.forEach(
        function (employee) {

            const status =
                String(
                    employee.status || ""
                ).toUpperCase();


            /*
             * Do not count inactive employees.
             */

            if (status === "INACTIVE") {
                return;
            }


            const departmentId =
                employee.department_id ??
                (
                    employee.department
                        ? employee.department.id
                        : null
                );


            if (
                departmentId !== null &&
                departmentId !== undefined
            ) {

                assignedEmployees++;

            } else {

                unassignedEmployees++;

            }

        }
    );


    const totalElement =
        document.getElementById(
            "departmentTotal"
        );

    const assignedElement =
        document.getElementById(
            "assignedEmployees"
        );

    const unassignedElement =
        document.getElementById(
            "unassignedEmployees"
        );


    if (totalElement) {

        totalElement.textContent =
            totalDepartments;

    }


    if (assignedElement) {

        assignedElement.textContent =
            assignedEmployees;

    }


    if (unassignedElement) {

        unassignedElement.textContent =
            unassignedEmployees;

    }

}


/* =========================================================
   RENDER DEPARTMENTS
   ========================================================= */

function renderDepartments() {

    const tableBody =
        document.getElementById(
            "departmentsTableBody"
        );

    const emptyState =
        document.getElementById(
            "departmentEmpty"
        );


    if (!tableBody) {
        return;
    }


    const searchInput =
        document.getElementById(
            "departmentSearch"
        );


    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    let filteredDepartments =
        allDepartments;


    /* -----------------------------------------------
       SEARCH FILTER
       ----------------------------------------------- */

    if (searchTerm) {

        filteredDepartments =
            allDepartments.filter(
                function (department) {

                    const name =
                        String(
                            department.name || ""
                        ).toLowerCase();


                    return name.includes(
                        searchTerm
                    );

                }
            );

    }


    tableBody.innerHTML = "";


    /* -----------------------------------------------
       EMPTY STATE
       ----------------------------------------------- */

    if (
        filteredDepartments.length === 0
    ) {

        if (emptyState) {

            emptyState.hidden = false;

        }

        return;

    }


    if (emptyState) {

        emptyState.hidden = true;

    }


    /* -----------------------------------------------
       CREATE TABLE ROWS
       ----------------------------------------------- */

    filteredDepartments.forEach(
        function (department) {

            const row =
                document.createElement(
                    "tr"
                );


            const employeeCount =
                getDepartmentEmployeeCount(
                    department.id
                );


            const createdDate =
                formatDate(
                    department.created_at
                );


            /*
             * Match the CSS:
             *
             * .department-status
             */

            const statusText =
                employeeCount > 0
                    ? "In Use"
                    : "Empty";


            const statusClass =
                employeeCount > 0
                    ? "department-status"
                    : "department-status department-status-empty";


            row.innerHTML = `

                <td>

                    <div class="department-name-cell">

                        <div class="department-avatar">
                            ${escapeHtml(
                                getDepartmentInitial(
                                    department.name
                                )
                            )}
                        </div>

                        <div class="department-name-content">

                            <strong>
                                ${escapeHtml(
                                    department.name
                                )}
                            </strong>

                            <span>
                                Department
                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    <span class="employee-count">
                        ${employeeCount}
                    </span>

                </td>


                <td>
                    ${createdDate}
                </td>


                <td>

                    <span class="${statusClass}">

                        ${statusText}

                    </span>

                </td>


                <td>

                    <div class="department-actions">

                        <button
                            type="button"
                            class="table-action"
                            data-action="edit"
                            data-id="${Number(
                                department.id
                            )}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="table-action delete"
                            data-action="delete"
                            data-id="${Number(
                                department.id
                            )}"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    setupTableActions();

}


/* =========================================================
   DEPARTMENT EMPLOYEE COUNT
   ========================================================= */

function getDepartmentEmployeeCount(
    departmentId
) {

    let count = 0;


    allEmployees.forEach(
        function (employee) {

            const status =
                String(
                    employee.status || ""
                ).toUpperCase();


            if (status === "INACTIVE") {
                return;
            }


            const employeeDepartmentId =
                employee.department_id ??
                (
                    employee.department
                        ? employee.department.id
                        : null
                );


            if (
                Number(employeeDepartmentId) ===
                Number(departmentId)
            ) {

                count++;

            }

        }
    );


    return count;

}


/* =========================================================
   TABLE ACTIONS
   ========================================================= */

function setupTableActions() {


    /* -----------------------------------------------
       EDIT
       ----------------------------------------------- */

    const editButtons =
        document.querySelectorAll(
            '[data-action="edit"]'
        );


    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    openEditDepartmentModal(
                        id
                    );

                }
            );

        }
    );


    /* -----------------------------------------------
       DELETE
       ----------------------------------------------- */

    const deleteButtons =
        document.querySelectorAll(
            '[data-action="delete"]'
        );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    openDeleteDepartmentModal(
                        id
                    );

                }
            );

        }
    );

}


/* =========================================================
   ADD DEPARTMENT
   ========================================================= */

function openAddDepartmentModal() {

    selectedDepartmentId = null;
    isEditMode = false;


    const modal =
        document.getElementById(
            "departmentModal"
        );

    const title =
        document.getElementById(
            "departmentModalTitle"
        );

    const description =
        document.getElementById(
            "departmentModalDescription"
        );

    const form =
        document.getElementById(
            "departmentForm"
        );

    const input =
        document.getElementById(
            "departmentName"
        );


    if (title) {

        title.textContent =
            "Add Department";

    }


    if (description) {

        description.textContent =
            "Create a new department.";

    }


    if (form) {

        form.reset();

    }


    hideDepartmentFormError();


    if (modal) {

        modal.hidden = false;

    }


    if (input) {

        setTimeout(
            function () {

                input.focus();

            },
            100
        );

    }

}


/* =========================================================
   EDIT DEPARTMENT
   ========================================================= */

function openEditDepartmentModal(
    departmentId
) {

    const department =
        allDepartments.find(
            function (item) {

                return Number(item.id) ===
                    Number(departmentId);

            }
        );


    if (!department) {
        return;
    }


    selectedDepartmentId =
        Number(departmentId);

    isEditMode = true;


    const modal =
        document.getElementById(
            "departmentModal"
        );

    const title =
        document.getElementById(
            "departmentModalTitle"
        );

    const description =
        document.getElementById(
            "departmentModalDescription"
        );

    const input =
        document.getElementById(
            "departmentName"
        );


    if (title) {

        title.textContent =
            "Edit Department";

    }


    if (description) {

        description.textContent =
            "Update the department name.";

    }


    if (input) {

        input.value =
            department.name || "";

    }


    hideDepartmentFormError();


    if (modal) {

        modal.hidden = false;

    }


    if (input) {

        setTimeout(
            function () {

                input.focus();
                input.select();

            },
            100
        );

    }

}


/* =========================================================
   SUBMIT ADD / EDIT
   ========================================================= */

async function handleDepartmentSubmit(
    event
) {

    event.preventDefault();


    const input =
        document.getElementById(
            "departmentName"
        );

    const saveButton =
        document.getElementById(
            "saveDepartmentButton"
        );


    const name =
        input
            ? input.value.trim()
            : "";


    hideDepartmentFormError();


    /* -----------------------------------------------
       VALIDATION
       ----------------------------------------------- */

    if (!name) {

        showDepartmentFormError(
            "Department name is required."
        );


        if (input) {

            input.focus();

        }


        return;

    }


    if (name.length < 2) {

        showDepartmentFormError(
            "Department name must contain at least 2 characters."
        );


        if (input) {

            input.focus();

        }


        return;

    }


    /*
     * Prevent duplicate department names on the
     * frontend before sending the request.
     */

    const duplicateDepartment =
        allDepartments.find(
            function (department) {

                const existingName =
                    String(
                        department.name || ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    existingName ===
                    name.toLowerCase() &&
                    Number(department.id) !==
                    Number(selectedDepartmentId)
                );

            }
        );


    if (duplicateDepartment) {

        showDepartmentFormError(
            "A department with this name already exists."
        );

        if (input) {

            input.focus();

        }

        return;

    }


    try {

        if (saveButton) {

            saveButton.disabled = true;

        }


        if (isEditMode) {

            if (saveButton) {

                saveButton.textContent =
                    "Updating...";

            }


            await updateDepartment(
                selectedDepartmentId,
                {
                    name: name
                }
            );

        } else {

            if (saveButton) {

                saveButton.textContent =
                    "Saving...";

            }


            await createDepartment(
                {
                    name: name
                }
            );

        }


        closeDepartmentModal();


        /*
         * Reload from backend so the UI always reflects
         * the database.
         */

        await loadPageData();


    } catch (error) {

        console.error(
            "Department save failed:",
            error
        );


        showDepartmentFormError(
            getErrorMessage(
                error,
                "Unable to save department."
            )
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                isEditMode
                    ? "Update Department"
                    : "Save Department";

        }

    }

}


/* =========================================================
   DELETE DEPARTMENT
   ========================================================= */

function openDeleteDepartmentModal(
    departmentId
) {

    const department =
        allDepartments.find(
            function (item) {

                return Number(item.id) ===
                    Number(departmentId);

            }
        );


    if (!department) {
        return;
    }


    selectedDepartmentId =
        Number(departmentId);


    const modal =
        document.getElementById(
            "deleteDepartmentModal"
        );

    const nameElement =
        document.getElementById(
            "deleteDepartmentName"
        );


    if (nameElement) {

        nameElement.textContent =
            department.name;

    }


    hideDeleteError();


    if (modal) {

        modal.hidden = false;

    }

}


/* =========================================================
   CONFIRM DELETE
   ========================================================= */

async function handleDeleteDepartment() {

    if (!selectedDepartmentId) {
        return;
    }


    const deleteButton =
        document.getElementById(
            "confirmDeleteButton"
        );


    try {

        if (deleteButton) {

            deleteButton.disabled = true;

            deleteButton.textContent =
                "Deleting...";

        }


        await deleteDepartment(
            selectedDepartmentId
        );


        closeDeleteDepartmentModal();


        await loadPageData();


    } catch (error) {

        console.error(
            "Department deletion failed:",
            error
        );


        showDeleteError(
            getErrorMessage(
                error,
                "Unable to delete department."
            )
        );


    } finally {

        if (deleteButton) {

            deleteButton.disabled = false;

            deleteButton.textContent =
                "Delete Department";

        }

    }

}


/* =========================================================
   CLOSE ADD / EDIT MODAL
   ========================================================= */

function closeDepartmentModal() {

    const modal =
        document.getElementById(
            "departmentModal"
        );


    if (modal) {

        modal.hidden = true;

    }


    selectedDepartmentId = null;
    isEditMode = false;


    hideDepartmentFormError();

}


/* =========================================================
   CLOSE DELETE MODAL
   ========================================================= */

function closeDeleteDepartmentModal() {

    const modal =
        document.getElementById(
            "deleteDepartmentModal"
        );


    if (modal) {

        modal.hidden = true;

    }


    selectedDepartmentId = null;


    hideDeleteError();

}


/* =========================================================
   FORM ERROR
   ========================================================= */

function showDepartmentFormError(
    message
) {

    const errorBox =
        document.getElementById(
            "departmentFormError"
        );

    const messageElement =
        document.getElementById(
            "departmentFormErrorMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    if (errorBox) {

        errorBox.hidden = false;

    }

}


function hideDepartmentFormError() {

    const errorBox =
        document.getElementById(
            "departmentFormError"
        );

    const messageElement =
        document.getElementById(
            "departmentFormErrorMessage"
        );


    if (messageElement) {

        messageElement.textContent = "";

    }


    if (errorBox) {

        errorBox.hidden = true;

    }

}


/* =========================================================
   DELETE ERROR
   ========================================================= */

function showDeleteError(
    message
) {

    const errorBox =
        document.getElementById(
            "deleteDepartmentError"
        );

    const messageElement =
        document.getElementById(
            "deleteDepartmentErrorMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    if (errorBox) {

        errorBox.hidden = false;

    }

}


function hideDeleteError() {

    const errorBox =
        document.getElementById(
            "deleteDepartmentError"
        );

    const messageElement =
        document.getElementById(
            "deleteDepartmentErrorMessage"
        );


    if (messageElement) {

        messageElement.textContent = "";

    }


    if (errorBox) {

        errorBox.hidden = true;

    }

}


/* =========================================================
   LOADING / ERROR STATES
   ========================================================= */

function showLoading() {

    const loading =
        document.getElementById(
            "departmentLoading"
        );

    const table =
        document.getElementById(
            "departmentTableWrapper"
        );

    const errorBox =
        document.getElementById(
            "departmentError"
        );


    if (loading) {

        loading.hidden = false;

    }


    if (table) {

        table.hidden = true;

    }


    if (errorBox) {

        errorBox.hidden = true;

    }

}


function showTable() {

    const loading =
        document.getElementById(
            "departmentLoading"
        );

    const table =
        document.getElementById(
            "departmentTableWrapper"
        );


    if (loading) {

        loading.hidden = true;

    }


    if (table) {

        table.hidden = false;

    }

}


function showError(
    message
) {

    const loading =
        document.getElementById(
            "departmentLoading"
        );

    const table =
        document.getElementById(
            "departmentTableWrapper"
        );

    const errorBox =
        document.getElementById(
            "departmentError"
        );

    const errorMessage =
        document.getElementById(
            "departmentErrorMessage"
        );


    if (loading) {

        loading.hidden = true;

    }


    if (table) {

        table.hidden = true;

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

    }


    if (errorBox) {

        errorBox.hidden = false;

    }

}


function hideError() {

    const errorBox =
        document.getElementById(
            "departmentError"
        );


    if (errorBox) {

        errorBox.hidden = true;

    }

}


/* =========================================================
   CURRENT USER
   ========================================================= */

function loadCurrentUser() {

    try {

        /*
         * IMPORTANT:
         * The current frontend configuration uses
         * ADMIN_USER_KEY, not USER_KEY.
         */

        const storedUser =
            localStorage.getItem(
                APP_CONFIG.ADMIN_USER_KEY
            );


        if (!storedUser) {
            return;
        }


        const user =
            JSON.parse(storedUser);


        const usernameElement =
            document.getElementById(
                "currentUsername"
            );


        const avatarElement =
            document.querySelector(
                ".admin-avatar"
            );


        if (usernameElement) {

            usernameElement.textContent =
                user.username || "Admin";

        }


        if (avatarElement) {

            avatarElement.textContent =
                getInitials(
                    user.username || "Admin"
                );

        }

    } catch (error) {

        console.error(
            "Unable to load current user:",
            error
        );

    }

}


/* =========================================================
   CURRENT DATE
   ========================================================= */

function setCurrentDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    if (!dateElement) {
        return;
    }


    const now =
        new Date();


    dateElement.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


/* =========================================================
   UTILITIES
   ========================================================= */

function getInitials(
    name
) {

    if (!name) {

        return "A";

    }


    const parts =
        name
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}


function getDepartmentInitial(
    name
) {

    if (!name) {

        return "D";

    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


function formatDate(
    value
) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function getErrorMessage(
    error,
    fallback
) {

    if (
        error &&
        typeof error.message === "string" &&
        error.message.trim()
    ) {

        return error.message;

    }


    return fallback;

}