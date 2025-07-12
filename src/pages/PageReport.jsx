import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import axios from "axios";
import {
  BarChart2,
  PieChart,
  Loader2,
  XCircle,
  Info,
  ClipboardList,
} from "lucide-react";
import {
  Card,
  Typography,
  Space,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
} from "antd";

const { Title, Text } = Typography;

// 1. Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

// Define API URL
const API_URL = "http://localhost:3000/api/v1/report/analyze-jobs";

function PageReport() {
  // 2. Use state to manage data, loading, and error states
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Use useEffect to fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        // Use response.data to get the JSON payload from axios
        setSalaryData(response.data.averageSalaries);
      } catch (err) {
        // Set error state if fetch fails
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        // Always set loading to false after fetch
        setLoading(false);
      }
    };

    fetchData();
  }, []); // The empty dependency array ensures this effect runs only once on mount

  // 4. Prepare data for the charts
  const chartLabels = salaryData ? salaryData.map((item) => item.category) : [];
  const chartValues = salaryData
    ? salaryData.map((item) => item.averageSalary)
    : [];

  // Data for the Bar chart
  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Average Salary (VNĐ)",
        data: chartValues,
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Data for the Pie chart
  const pieChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Average Salary by Job Category",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("vi-VN") + " VNĐ";
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Salary Distribution by Category",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "96px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text type="secondary">Đang tải dữ liệu báo cáo...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Alert
          message={`Lỗi: ${error}`}
          description="Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau."
          type="error"
          icon={<XCircle />}
          style={{ marginBottom: "24px" }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2} style={{ marginBottom: "16px" }}>
          <Space>
            <BarChart2 style={{ color: "#1890ff" }} />
            Analytics Dashboard
          </Space>
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Phân tích dữ liệu lương theo ngành nghề
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={
                <Space>
                  <ClipboardList style={{ color: "#1890ff" }} />
                  Tổng số ngành nghề
                </Space>
              }
              value={salaryData ? salaryData.length : 0}
              suffix="ngành"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={
                <Space>
                  <BarChart2 style={{ color: "#52c41a" }} />
                  Lương trung bình cao nhất
                </Space>
              }
              value={
                salaryData
                  ? Math.max(...salaryData.map((item) => item.averageSalary))
                  : 0
              }
              suffix="VNĐ"
              formatter={(value) => value.toLocaleString("vi-VN")}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={
                <Space>
                  <Info style={{ color: "#faad14" }} />
                  Lương trung bình thấp nhất
                </Space>
              }
              value={
                salaryData
                  ? Math.min(...salaryData.map((item) => item.averageSalary))
                  : 0
              }
              suffix="VNĐ"
              formatter={(value) => value.toLocaleString("vi-VN")}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChart2 style={{ color: "#1890ff" }} />
                Biểu đồ cột - Lương trung bình
              </Space>
            }
            style={{ height: "400px" }}
          >
            <div style={{ height: "300px" }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChart style={{ color: "#1890ff" }} />
                Biểu đồ tròn - Phân bố lương
              </Space>
            }
            style={{ height: "400px" }}
          >
            <div style={{ height: "300px" }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      {salaryData && salaryData.length > 0 && (
        <Card
          title={
            <Space>
              <ClipboardList style={{ color: "#1890ff" }} />
              Chi tiết dữ liệu
            </Space>
          }
          style={{ marginTop: "24px" }}
        >
          <Row gutter={[16, 16]}>
            {salaryData.map((item, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title={item.category}
                    value={item.averageSalary}
                    suffix="VNĐ"
                    formatter={(value) => value.toLocaleString("vi-VN")}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
}

export default PageReport;
