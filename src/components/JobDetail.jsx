import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  ClipboardList,
  Gift,
  Info,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
} from "lucide-react";
import {
  Button,
  Card,
  Typography,
  Space,
  Spin,
  Row,
  Col,
  Tag,
  Descriptions,
  message,
} from "antd";
import api from "../config/axios"; // ✅ dùng config Axios

const { Title, Text, Paragraph } = Typography;

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      message.loading({ content: "Đang tải chi tiết công việc...", key: "load" });

      const response = await api.get(`/recommendation/job/${jobId}`);
      const result = response.data;

      if (result.success) {
        setJob(result.data.job);
        message.success({ content: "Tải thành công", key: "load", duration: 1 });
      } else {
        message.error({ content: result.message || "Không thể tải dữ liệu", key: "load" });
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết công việc:", error);
      message.error({
        content: `Lỗi: ${error?.response?.data?.message || error.message}`,
        key: "load",
      });
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, fetchJobDetails]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "96px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text type="secondary">Đang tải thông tin công việc...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Card>
          <Space direction="vertical" size="large" style={{ textAlign: "center", width: "100%" }}>
            <Info style={{ fontSize: "48px", color: "#d9d9d9" }} />
            <Text type="danger">Không tìm thấy thông tin công việc.</Text>
            <Button
              type="primary"
              icon={<ArrowLeft />}
              onClick={handleBackClick}
            >
              Quay lại danh sách
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header with Back Button */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
        <Button
          icon={<ArrowLeft />}
          onClick={handleBackClick}
          style={{ marginRight: "16px" }}
        >
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          <Space>
            <Briefcase style={{ color: "#1890ff" }} />
            Chi tiết công việc
          </Space>
        </Title>
      </div>

      {/* Job Header */}
      <Card
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
          color: "white",
          marginBottom: "32px",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Title level={2} style={{ color: "white", marginBottom: "8px" }}>
          <Space>
            <Briefcase style={{ color: "white" }} />
            {job.title}
          </Space>
        </Title>
        <Title level={3} style={{ color: "rgba(255,255,255,0.9)", marginBottom: "16px" }}>
          <Space>
            <Building2 style={{ color: "white" }} />
            {job.company}
          </Space>
        </Title>
        <Space size="large">
          <Tag color="white" style={{ color: "#1890ff", border: "none" }}>
            <MapPin style={{ marginRight: "4px" }} />
            {job.location}
          </Tag>
          <Tag color="white" style={{ color: "#1890ff", border: "none" }}>
            <Briefcase style={{ marginRight: "4px" }} />
            {job.jobType}
          </Tag>
          <Tag color="white" style={{ color: "#1890ff", border: "none" }}>
            <DollarSign style={{ marginRight: "4px" }} />
            {job.salaryRange}
          </Tag>
        </Space>
      </Card>

      {/* Job Details Grid */}
      <Row gutter={[24, 24]}>
        {/* Description */}
        <Col xs={24} lg={12}>
          <Card title={
            <Space>
              <ClipboardList style={{ color: "#1890ff" }} />
              Mô tả công việc
            </Space>
          }>
            <Paragraph style={{ margin: 0 }}>
              {job.description || "Không có mô tả"}
            </Paragraph>
          </Card>
        </Col>

        {/* Requirements */}
        {job.requirements && (
          <Col xs={24} lg={12}>
            <Card title={
              <Space>
                <ClipboardList style={{ color: "#1890ff" }} />
                Yêu cầu
              </Space>
            }>
              <Paragraph style={{ margin: 0 }}>
                {job.requirements}
              </Paragraph>
            </Card>
          </Col>
        )}

        {/* Benefits */}
        {job.benefits && (
          <Col xs={24} lg={12}>
            <Card title={
              <Space>
                <Gift style={{ color: "#1890ff" }} />
                Quyền lợi
              </Space>
            }>
              <Paragraph style={{ margin: 0 }}>
                {job.benefits}
              </Paragraph>
            </Card>
          </Col>
        )}

        {/* Job Info */}
        <Col xs={24} lg={12}>
          <Card title={
            <Space>
              <Info style={{ color: "#1890ff" }} />
              Thông tin công việc
            </Space>
          }>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<Space><BookOpen /> Kinh nghiệm</Space>}>
                {job.experience || "Không yêu cầu"}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><GraduationCap /> Học vấn</Space>}>
                {job.education || "Không yêu cầu"}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><Briefcase /> Ngành nghề</Space>}>
                {job.industry || "Không xác định"}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><Clock /> Giờ làm việc</Space>}>
                {job.workingHours || "8 giờ/ngày"}
              </Descriptions.Item>
              {job.deadline && (
                <Descriptions.Item label={<Space><CalendarCheck2 /> Hạn nộp</Space>}>
                  {new Date(job.deadline).toLocaleDateString("vi-VN")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Apply Button */}
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <Button
          type="primary"
          size="large"
          icon={<ClipboardList />}
          style={{
            height: "56px",
            paddingLeft: "48px",
            paddingRight: "48px",
            fontSize: "18px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
            border: "none",
          }}
        >
          Ứng tuyển ngay
        </Button>
      </div>

      {/* Posted Date */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <Text type="secondary">
          <Space>
            <CalendarCheck2 />
            Đăng ngày: {new Date(job.postedDate).toLocaleDateString("vi-VN")}
          </Space>
        </Text>
      </div>
    </div>
  );
};

export default JobDetail;
