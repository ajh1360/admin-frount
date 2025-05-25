// src/pages/DashboardPage.js
import React from 'react';

const DashboardPage = () => {
  return (
    <div>
      <h1 className="page-title">관리자 페이지</h1>
      <p className="page-subtitle">Administrator Page</p>
      {/* 실제 그래프 라이브러리를 사용하거나 SVG/Canvas로 그립니다. */}
      <div className="graph-placeholder">
        {/* Placeholder for graph using background image from CSS */}
      </div>
    </div>
  );
};

export default DashboardPage;