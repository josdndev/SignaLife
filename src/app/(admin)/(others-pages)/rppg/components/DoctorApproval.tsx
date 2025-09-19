// src/app/rppg/components/DoctorApproval.tsx

import React from 'react';

const DoctorApproval = () => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px' }}>
      <h2>Doctor Approval</h2>
      <form>
        <div>
          <label htmlFor="secretKey">Doctor Secret Key:</label>
          <input type="password" id="secretKey" name="secretKey" />
        </div>
        <button type="submit">Approve</button>
      </form>
    </div>
  );
};

export default DoctorApproval;
