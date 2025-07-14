import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import CVUpload from "./components/CVUpload.jsx";
import JobSelector from "./components/JobSelector.jsx";
import CustomJobInput from "./components/CustomJobInput.jsx";
import JobDetail from "./components/JobDetail.jsx";
import PageReport from "./pages/PageReport.jsx";
import {
  FileUp,
  Briefcase,
  BarChart2,
} from "lucide-react";
import {
  Layout,
  Typography,
  Button,
  Space,
} from "antd";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function AppContent() {
  const [activeTab, setActiveTab] = useState("cv-upload");
  const navigate = useNavigate();
  const location = useLocation();

  const isJobDetailPage = location.pathname.startsWith("/job/");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate("/");
  };

  const handleGoToReportPage = () => {
    navigate("/report-page");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 50%, #f0f0ff 100%)" }}>
      <Header style={{ 
        background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)", 
        padding: "32px 24px",
        height: "auto",
        lineHeight: "normal"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
          <Title level={1} style={{ 
            color: "white", 
            margin: 0, 
            marginBottom: "8px",
            background: "linear-gradient(135deg, #ffffff 0%, #e6f7ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            <Space>
              <BarChart2 style={{ color: "#e6f7ff" }} />
              Applicant Tracking System
            </Space>
          </Title>
          <Text style={{ 
            fontSize: "20px", 
            color: "#e6f7ff", 
            fontWeight: "500" 
          }}>
            AI-Powered Job & CV Matching Platform
          </Text>
        </div>
      </Header>

      {!isJobDetailPage && (
        <div style={{ 
          background: "white", 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderBottom: "1px solid #f0f0f0"
        }}>
          <div style={{ 
            maxWidth: "1400px", 
            margin: "0 auto", 
            padding: "16px 24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px"
          }}>
            <Button
              type={activeTab === "cv-upload" ? "primary" : "default"}
              size="large"
              icon={<FileUp style={{ display: "inline-flex", alignItems: "center" }}/>}
              onClick={() => handleTabChange("cv-upload")}
              style={{
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                borderRadius: "12px",
                fontWeight: "600"
              }}
            >
            <span className="pl-2 pr-2 inline-flex justify-center items-center">  Upload CV → Get Jobs</span>
            </Button>
            <Button
              type={activeTab === "job-selector" ? "primary" : "default"}
              size="large"
              icon={<Briefcase style={{ display: "inline-flex", alignItems: "center" }}/>}
              onClick={() => handleTabChange("job-selector")}
              style={{
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                borderRadius: "12px",
                fontWeight: "600"
              }}
            >
                <span className="pl-2 pr-2 inline-flex justify-center items-center">    Select Job → Get CVs</span>
            
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<BarChart2 style={{ display: "inline-flex", alignItems: "center", }}/>}
              onClick={handleGoToReportPage}
              style={{
                height: "48px",
                paddingLeft: "24px",
                paddingRight: "24px",
                borderRadius: "12px",
                fontWeight: "600",
                background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                border: "none"
              }}
            >
              <span className="pl-2 pr-2 inline-flex justify-center items-center">  Analytics Dashboard</span>
             
            </Button>
          </div>
        </div>
      )}

      <Content style={{ 
        padding: activeTab === "cv-upload" && !isJobDetailPage ? "32px 24px" : "32px 24px",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%"
      }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                {activeTab === "cv-upload" && <CVUpload />}
                {activeTab === "job-selector" && <JobSelector />}
                {activeTab === "custom-job" && <CustomJobInput />}
              </>
            }
          />
          <Route path="/job/:jobId" element={<JobDetail />} />
          <Route path="/report-page" element={<PageReport />} />
        </Routes>
      </Content>

      <Footer style={{ 
        background: "#001529", 
        color: "white", 
        textAlign: "center",
        padding: "24px"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Text style={{ color: "#bfbfbf", fontWeight: "500" }}>
            Powered by TF-IDF + Cosine Similarity Algorithm
          </Text>
        </div>
      </Footer>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
