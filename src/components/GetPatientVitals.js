import React, { useState, useEffect } from "react";
import axios from "axios";

const GetPatientVitals = ({ accessData, iss }) => {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientVitals = async () => {
      if (!accessData || !accessData.patient || !accessData.access_token) {
        console.log("AccessData is not yet ready:", accessData);
        return;
      }

      try {
        const response = await axios.get(
          `${iss}/Observation/?category=vital-signs&patient=${accessData.patient}&sort=date`,
          {
            headers: {
              Authorization: `Bearer ${accessData.access_token}`,
            },
          }
        );
        let vitalsData = response.data.entry || [];
        setVitals((prevVitals) => [...prevVitals, ...vitalsData]);
        console.log("vitals", vitalsData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (accessData && accessData.patient && accessData.access_token) {
      fetchPatientVitals();
    }
  }, [accessData, iss]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <ul>
          {vitals.map((vital, index) => {
            const resource = vital.resource || {};
            const codeText = resource?.code?.text || "N/A";
            const status = resource?.status || "N/A";
            const effectiveDate = resource?.effectiveDateTime
              ? new Date(resource.effectiveDateTime).toLocaleString()
              : "N/A";
            const patientId =
              resource?.subject?.reference?.split("/")[1] || "N/A";
            const practitionerId =
              resource?.performer?.[0]?.reference?.split("/")[1] || "N/A";

            let value = "N/A";
            let unit = "";

            if (codeText === "Blood pressure") {
              const systolic = resource?.component?.find((comp) =>
                comp.code.coding.some((coding) => coding.code === "8480-6")
              );
              const diastolic = resource?.component?.find((comp) =>
                comp.code.coding.some((coding) => coding.code === "8462-4")
              );
              value = `Systolic: ${systolic?.valueQuantity?.value || "N/A"} ${
                systolic?.valueQuantity?.unit || ""
              }, Diastolic: ${diastolic?.valueQuantity?.value || "N/A"} ${
                diastolic?.valueQuantity?.unit || ""
              }`;
            } else {
              value = resource?.valueQuantity?.value || "N/A";
              unit = resource?.valueQuantity?.unit || "";
            }

            return (
              <li key={index}>
                <strong>Vital Sign:</strong> {codeText} <br />
                <strong>Value:</strong> {value} {unit} <br />
                <strong>Status:</strong> {status} <br />
                <strong>Effective Date:</strong> {effectiveDate} <br />
                <strong>Patient ID:</strong> {patientId} <br />
                <strong>Practitioner ID:</strong> {practitionerId}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default GetPatientVitals;
