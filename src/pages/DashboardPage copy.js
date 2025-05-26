// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2'; // 예시로 Chart.js 사용
// Chart.js 사용을 위해 필요한 요소들을 import 해야 할 수 있습니다.
// 예: import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const DashboardPage = () => {
  const [serverUsage, setServerUsage] = useState(null); // 또는 그래프 데이터 구조에 맞게 초기화
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 여기에 실제 API 엔드포인트를 넣으세요.
        const response = await fetch('/api/server-usage'); // 백엔드 API 주소
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setServerUsage(data); // API 응답 형식에 따라 적절히 가공 필요
        setError(null);
      } catch (err) {
        setError(err.message);
        setServerUsage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 5초마다 데이터 업데이트 (선택 사항)
    const intervalId = setInterval(fetchData, 5000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, []); // 빈 배열: 컴포넌트 마운트 시 1회 실행

  // Chart.js를 위한 데이터 가공 예시 (API 응답이 시간에 따른 배열 형태라고 가정)
  const chartData = {
    labels: serverUsage ? serverUsage.map(d => new Date(d.timestamp).toLocaleTimeString()) : [],
    datasets: [
      {
        label: 'CPU 사용률 (%)',
        data: serverUsage ? serverUsage.map(d => d.cpu) : [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: '메모리 사용률 (%)',
        data: serverUsage ? serverUsage.map(d => d.memory) : [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  if (loading) return <p>데이터 로딩 중...</p>;
  if (error) return <p>에러 발생: {error}</p>;

  return (
    <div>
      <h1 className="page-title">관리자 페이지</h1>
      <p className="page-subtitle">Administrator Page</p>
      <div className="graph-container" style={{ width: '80%', margin: 'auto' }}>
        {serverUsage ? (
          <Line data={chartData} /> // Chart.js Line 그래프 컴포넌트 사용
        ) : (
          <p>서버 사용량 데이터를 불러오지 못했습니다.</p>
        )}
      </div>
      {/* 추가적인 그래프나 정보 표시 */}
    </div>
  );
};

export default DashboardPage;