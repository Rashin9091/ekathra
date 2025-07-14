// src/App.js
import React, { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function App() {
  const [page, setPage] = useState("register");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [people, setPeople] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [adminPass, setAdminPass] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    const fetchPeople = async () => {
      const querySnapshot = await getDocs(collection(db, "people"));
      const peopleList = querySnapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        docId: docSnap.id,
      }));
      setPeople(peopleList);
    };
    fetchPeople();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const registerPerson = async () => {
    if (!form.name || !form.phone) return;

    const isDuplicate = people.find(
      (p) => p.name.toLowerCase() === form.name.toLowerCase()
    );
    if (isDuplicate) {
      alert("This name is already registered.");
      return;
    }

    const newEntry = {
      name: form.name,
      phone: form.phone,
      id: uuidv4(),
    };

    const docRef = await addDoc(collection(db, "people"), newEntry);
    setPeople([...people, { ...newEntry, docId: docRef.id }]);
    setCurrentPerson(newEntry);
    setShowReceipt(true);
    setForm({ name: "", phone: "" });
  };

  const deletePerson = async (id, docId) => {
    await deleteDoc(doc(db, "people", docId));
    setPeople(people.filter((p) => p.id !== id));
  };

  const downloadCSV = () => {
    const csvContent = [
      ["Name", "Phone", "Receipt ID"],
      ...people.map((p) => [p.name, p.phone, p.id]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ekathra_registrations.csv";
    a.click();
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, height);
    pdf.save(`EKATHRA_Receipt_${currentPerson.name}.pdf`);
  };

  const handleAdminLogin = () => {
    if (adminPass === "ekathra25") {
      setIsAdmin(true);
      setPage("admin");
    } else {
      alert("Incorrect password");
    }
  };

  const darkStyles = {
    backgroundColor: "#121212",
    color: "#f1f1f1",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const cardStyle = {
    backgroundColor: "#1e1e1e",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(255,255,255,0.1)",
  };

  const buttonStyle = {
    background: "#007bff",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    margin: "5px",
    transition: "transform 0.2s",
  };

  return (
    <div style={darkStyles}>
      <div>
        <header style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/ekathra-logo.jpeg.jpg"
            alt="EKATHRA Logo"
            style={{ width: "100px", marginBottom: "10px" }}
          />
          <h1>EKATHRA BATCH EVENT 25</h1>
          <p>4 November 2025 · Hyatt Regency</p>
          <div>
            <button style={buttonStyle} onClick={() => setPage("register")}>
              📝 Register
            </button>
            <button style={buttonStyle} onClick={() => setPage("login")}>
              🔐 Admin
            </button>
          </div>
        </header>

        {/* Registration Page */}
        {page === "register" && (
          <div style={{ ...cardStyle, maxWidth: "400px", margin: "auto" }}>
            <h2>Register</h2>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
                border: "1px solid #333",
              }}
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
                border: "1px solid #333",
              }}
            />
            <button
              onClick={registerPerson}
              style={{ ...buttonStyle, width: "100%" }}
            >
              ✅ Submit
            </button>

            {showReceipt && currentPerson && (
              <div
                ref={receiptRef}
                style={{
                  ...cardStyle,
                  marginTop: "20px",
                  border: "1px dashed #007bff",
                }}
              >
                <h3>🎫 Registration Receipt</h3>
                <img
                  src="/ekathra-logo.jpeg.jpg"
                  alt="EKATHRA Logo"
                  style={{ width: "70px", marginBottom: "10px" }}
                />
                <p>
                  <strong>Name:</strong> {currentPerson.name}
                </p>
                <p>
                  <strong>Phone:</strong> {currentPerson.phone}
                </p>
                <p>
                  <strong>Receipt ID:</strong> {currentPerson.id}
                </p>
                <p>
                  <strong>Date:</strong> 4 Nov 2025
                </p>
                <p>
                  <strong>Venue:</strong> Hyatt Regency
                </p>
                <div style={{ textAlign: "center", margin: "10px" }}>
                  <QRCodeCanvas value={currentPerson.id} size={120} />
                </div>
                <button
                  onClick={downloadPDF}
                  style={{
                    ...buttonStyle,
                    background: "#28a745",
                    width: "100%",
                  }}
                >
                  📄 Download PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin Login Page */}
        {page === "login" && !isAdmin && (
          <div style={{ ...cardStyle, maxWidth: "300px", margin: "auto" }}>
            <h3>Admin Login</h3>
            <input
              type="password"
              placeholder="Enter password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
                border: "1px solid #333",
              }}
            />
            <button
              style={{ ...buttonStyle, width: "100%" }}
              onClick={handleAdminLogin}
            >
              Login
            </button>
          </div>
        )}

        {/* Admin Dashboard */}
        {page === "admin" && isAdmin && (
          <div style={{ ...cardStyle, maxWidth: "800px", margin: "auto" }}>
            <h3>Admin Panel</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #ccc" }}>
                  <th style={{ padding: "8px" }}>Name</th>
                  <th style={{ padding: "8px" }}>Phone</th>
                  <th style={{ padding: "8px" }}>Receipt ID</th>
                  <th style={{ padding: "8px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #555" }}>
                    <td style={{ padding: "8px" }}>{p.name}</td>
                    <td style={{ padding: "8px" }}>{p.phone}</td>
                    <td style={{ padding: "8px" }}>{p.id}</td>
                    <td style={{ padding: "8px" }}>
                      <button
                        onClick={() => deletePerson(p.id, p.docId)}
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={downloadCSV}
              style={{
                ...buttonStyle,
                background: "#ffc107",
                color: "#000",
                width: "100%",
              }}
            >
              📥 Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          marginTop: "40px",
          fontSize: "14px",
          color: "#aaa",
        }}
      >
        CREATED BY RASHIN
      </footer>
    </div>
  );
}
