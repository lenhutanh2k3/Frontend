import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div style={{
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  }}>
    <h1 style={{ fontSize: "5rem", margin: 0 }}>404</h1>
    <h2>Không tìm thấy trang</h2>
    <p>Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
    <Link to="/" style={{
      marginTop: "1rem",
      padding: "0.5rem 1.5rem",
      background: "#007bff",
      color: "#fff",
      borderRadius: "4px",
      textDecoration: "none"
    }}>
      Quay về trang chủ
    </Link>
  </div>
);

export default NotFoundPage; 