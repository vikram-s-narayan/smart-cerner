import React, { useState } from "react";
import axios from "axios";

const CreateVital = ({ accessData, iss }) => {
  const [value, setValue] = useState(""); // Value input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Extract practitioner ID from fhirUser URL in accessData
  const practitionerUrl = accessData?.id_token
    ? JSON.parse(atob(accessData.id_token.split(".")[1])).fhirUser
    : null;
  const practitionerId = practitionerUrl
    ? practitionerUrl.split("/").pop()
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!practitionerId) {
      setError("Practitioner information missing.");
      setLoading(false);
      return;
    }

    const vitalData = {
      resourceType: "Observation",
      status: "final",
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs",
            },
          ],
          text: "Vital Signs",
        },
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "8331-1",
          },
        ],
        text: "Temperature Oral",
      },
      valueQuantity: {
        value: 37.5,
        unit: "degC",
        system: "http://unitsofmeasure.org",
        code: "Cel",
      },
      effectiveDateTime: new Date().toISOString(), // Automatically set current date/time
      issued: new Date().toISOString(), // Automatically set issued date/time
      subject: {
        reference: `Patient/${accessData.patient}`, // Dynamically uses patient from accessData
      },
      performer: [
        {
          extension: [
            {
              valueCodeableConcept: {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                    code: "LA",
                    display: "legal authenticator",
                  },
                ],
                text: "legal authenticator",
              },
              url: "http://hl7.org/fhir/StructureDefinition/event-performerFunction",
            },
          ],
          reference: `Practitioner/${practitionerId}`, // Dynamically uses practitionerId
        },
      ],
    };
    try {
      console.log("vitalData", vitalData);
      console.log("accessData patient", accessData.patient);
      const url = `${iss}/Observation?category=vital-signs&patient=${accessData.patient}`;

      const response = await axios.post(url, vitalData, {
        headers: {
          Authorization: `Bearer ${accessData.access_token}`,
          //   "Content-Type": "application/json",
        },
      });
      setLoading(false);
      setSuccess(true);
      setValue("");
      console.log("Vital sign created:", response.data);
    } catch (error) {
      setLoading(false);
      setError(error.response ? error.response.data : error.message);
      console.error("Error creating vital sign:", error);
    }
  };

  return (
    <div>
      <h2>Create New Observation</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Temperature (°C):</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Observation"}
        </button>
      </form>
      {error && <p>Error: {error}</p>}
      {success && <p>Observation created successfully!</p>}
    </div>
  );
};

export default CreateVital;
