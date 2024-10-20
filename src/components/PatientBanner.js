import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";

const PatientBanner = ({ accessData, iss }) => {
  const [patientName, setPatientName] = useState("");
  const [patientBirthday, setPatientBirthday] = useState("");
  const [patientGender, setPatientGender] = useState("");
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(
          `${iss}/Patient/${accessData.patient}`,
          {
            headers: {
              Authorization: `Bearer ${accessData.access_token}`,
            },
          }
        );
        console.log("Patient data:", response.data);
        setPatientName(response.data.name[0].text);
        setPatientBirthday(response.data.birthDate);
        setPatientGender(response.data.gender);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    if (accessData && accessData.patient) {
      fetchPatientData();
    }
  }, [accessData, iss]);

  return (
    <div>
      {accessData?.need_patient_banner && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>{patientName}</p>
          <p>{patientBirthday}</p>
          <p>{patientGender}</p>
        </div>
      )}
    </div>
  );
};

export default PatientBanner;
