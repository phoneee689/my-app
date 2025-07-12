import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileUp,
  Loader2,
  Briefcase,
  FileText,
  Building2,
  MapPin,
  ClipboardList,
  Link2,
  Search,
  Users,
} from "lucide-react";
import {
  Upload,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  message,
  Typography as AntdTypography,
} from "antd";
import api from "../config/axios"; // ✅ Axios instance giống file trước

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const CVUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    if (
      file &&
      (file.type === "application/pdf" ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx"))
    ) {
      setSelectedFile(file);
      return false;
    } else {
      message.error("Vui lòng chọn tệp CV hợp lệ (PDF, DOC, hoặc DOCX)");
      setSelectedFile(null);
      return false;
    }
  };

  const initializeSystem = async () => {
    const res = await api.post("/complete-flow/initialize");
    return res.data;
  };

  const uploadCV = async () => {
    if (!selectedFile) {
      message.error("Vui lòng chọn tệp CV trước");
      return;
    }

    setIsUploading(true);
    setJobRecommendations([]);

    try {
      message.loading({ content: "Khởi tạo hệ thống...", key: "status" });
      await initializeSystem();

      message.loading({ content: "Đang phân tích CV...", key: "status" });

      const formData = new FormData();
      formData.append("cvFile", selectedFile);

      const response = await api.post("/complete-flow/upload-cv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;

      if (result.success) {
        setJobRecommendations(result.data.jobRecommendations || []);
        message.success({
          content: `Đã tìm thấy ${result.data.totalRecommendations || 0} công việc phù hợp`,
          key: "status",
        });
      } else {
        throw new Error(result.error || "Không thể xử lý CV");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error({ content: `Lỗi: ${error.message}`, key: "status" });
    } finally {
      setIsUploading(false);
    }
  };

  const uploadProps = {
    name: "cvFile",
    multiple: false,
    accept: ".pdf,.doc,.docx",
    beforeUpload: handleFileSelect,
    showUploadList: false,
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2}>
          <Space>
            <FileUp style={{ color: "#1890ff" }} />
            Tải lên CV của bạn
          </Space>
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Nhận gợi ý công việc phù hợp từ hệ thống AI thông minh
        </Text>
      </div>

      <Card style={{ marginBottom: "32px" }}>
        <Dragger {...uploadProps} disabled={isUploading}>
          {selectedFile ? (
            <Space direction="vertical" size="large">
             <div className="flex space-x-2">
             <FileText style={{ fontSize: "64px", color: "#52c41a" }} />
             <Title level={4}>Tệp đã chọn:</Title>
             </div>
              <Text strong>{selectedFile.name}</Text>
              <Text type="secondary">
                Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </Space>
          ) : (
            <Space direction="vertical" size="large">
              <div className="flex space-x-2">
              <Search style={{ fontSize: "64px", color: "#1890ff" }} />
              <Title level={4}>Kéo và thả CV hoặc nhấn để chọn</Title>
              </div>
              <Text type="secondary">Định dạng hỗ trợ: PDF, DOC, DOCX</Text>
              <Text type="secondary">Dung lượng tối đa: 10MB</Text>
            </Space>
          )}
        </Dragger>
      </Card>

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Button
          type="primary"
          size="large"
          icon={isUploading ? <Loader2 className="animate-spin" /> : <FileUp />}
          onClick={uploadCV}
          disabled={!selectedFile || isUploading}
          loading={isUploading}
          style={{ height: "48px", paddingLeft: "32px", paddingRight: "32px" }}
        >
          {isUploading ? "Đang xử lý..." : "Tìm công việc phù hợp"}
        </Button>
      </div>

      {jobRecommendations.length > 0 && (
        <div style={{ marginTop: "48px" }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: "24px" }}>
            <Space>
              <Briefcase style={{ color: "#1890ff" }} />
              Công việc được đề xuất ({jobRecommendations.length})
            </Space>
          </Title>

          <Row gutter={[16, 16]}>
            {jobRecommendations.map((job, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable
                  style={{ height: "100%" }}
                  actions={[
                    <Button
                      type="primary"
                      icon={<Search />}
                      onClick={() => navigate(`/job/${job.jobId}`)}
                    >
                      Chi tiết
                    </Button>,
                    job.jobUrl && (
                      <Button
                        icon={<Link2 />}
                        onClick={() => window.open(job.jobUrl, "_blank")}
                      >
                        Trang gốc
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <Card.Meta
                    title={
                      <Space>
                        <Building2 style={{ color: "#1890ff" }} />
                        {job.jobTitle || "Tên công việc"}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Tag color="blue">
                          <Users style={{ marginRight: "4px" }} />
                          {(job.matchPercentage || (job.score * 100)).toFixed(1)}%
                        </Tag>
                        <Text>
                          <Building2 style={{ marginRight: "8px" }} />
                          <Text strong>Công ty:</Text> {job.company || "Chưa rõ"}
                        </Text>
                        <Text>
                          <MapPin style={{ marginRight: "8px" }} />
                          <Text strong>Địa điểm:</Text> {job.location || "Không có thông tin"}
                        </Text>
                        <Text>
                          <ClipboardList style={{ marginRight: "8px" }} />
                          <Text strong>ID:</Text> {job.jobId}
                        </Text>
                        {job.description && (
                          <Paragraph ellipsis={{ rows: 3, expandable: true }} style={{ margin: 0 }}>
                            <Text strong>Mô tả:</Text> {job.description}
                          </Paragraph>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {!isUploading && jobRecommendations.length === 0 && selectedFile && (
        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <Card>
            <Space direction="vertical" size="large">
              <Briefcase style={{ fontSize: "32px", color: "#d9d9d9" }} />
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Không tìm thấy công việc phù hợp. Thử CV khác hoặc đảm bảo CV có kỹ năng rõ ràng.
              </Text>
            </Space>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CVUpload;
