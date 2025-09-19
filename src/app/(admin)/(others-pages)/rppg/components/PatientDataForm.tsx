// src/app/rppg/components/PatientDataForm.tsx

import React from 'react';

const PatientDataForm = () => {
  return (
    <form>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" />
      </div>
      <div>
        <label htmlFor="age">Age:</label>
        <input type="number" id="age" name="age" />
      </div>
      <div>
        <label htmlFor="gender">Gender:</label>
        <select id="gender" name="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="medicalHistory">Medical History:</label>
        <textarea id="medicalHistory" name="medicalHistory" />
      </div>
      <div>
        <label htmlFor="reasonForVisit">Reason for Visit:</label>
        <textarea id="reasonForVisit" name="reasonForVisit" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default PatientDataForm;
