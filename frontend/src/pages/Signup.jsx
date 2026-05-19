import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.post("/auth/signup", formData);

      alert("Signup successful");

      navigate("/login");

    } catch (error) {

      console.log(error);

      alert("Signup failed");

    }
  };

  return (
    <div>

      <h1>Signup</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <select
          name="role"
          onChange={handleChange}
        >

          <option value="member">
            Member
          </option>

          <option value="admin">
            Admin
          </option>

        </select>

        <button type="submit">
          Signup
        </button>

      </form>

    </div>
  );
}

export default Signup;