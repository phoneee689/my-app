
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spin, Alert, Typography, Descriptions } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";

const { Title, Paragraph } = Typography;

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:3000/api/v1";

  const fetchJobDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/recommendation/job/${jobId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch job details: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setJob(result.data.job);
      } else {
        throw new Error(result.message || "Failed to load job details");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, API_BASE]);

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
      <div className="container mx-auto p-6">
        <Card className="shadow-lg">
          <div className="text-center">
            <Spin size="large" />
            <Paragraph className="mt-4">Đang tải thông tin công việc...</Paragraph>
            <Paragraph>Job ID: {jobId}</Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="shadow-lg">
          <Alert message={`❌ Lỗi: ${error}`} type="error" showIcon className="mb-4" />
          <Paragraph>Job ID: {jobId}</Paragraph>
          <Paragraph>API URL: {API_BASE}/recommendation/job/{jobId}</Paragraph>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBackClick}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            ← Quay lại danh sách việc làm
          </Button>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <Card className="shadow-lg">
          <Alert message="Không tìm thấy công việc" type="warning" showIcon className="mb-4" />
          <Paragraph>Job ID: {jobId}</Paragraph>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBackClick}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            ← Quay lại danh sách việc làm
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <div className="flex items-center mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBackClick}
            className="mr-4 bg-gray-200 hover:bg-gray-300"
          >
            Quay lại
          </Button>
          <Title level={2} className="m-0 text-indigo-600">
            Chi tiết công việc
          </Title>
        </div>

        {/* Job Header */}
        <Card
          className="mb-6"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Title level={3} className="text-white m-0">
            {job.title}
          </Title>
          <Paragraph className="text-white opacity-90 text-lg">
            🏢 {job.company}
          </Paragraph>
          <div className="flex flex-wrap gap-4 text-white text-base">
            <span>📍 {job.location}</span>
            <span>💼 {job.jobType}</span>
            <span>💰 {job.salaryRange}</span>
          </div>
        </Card>

        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="📋 Mô tả công việc" className="shadow-md">
            <Paragraph>{job.description || "Không có mô tả"}</Paragraph>
          </Card>

          {job.requirements && (
            <Card title="✅ Yêu cầu" className="shadow-md">
              <Paragraph>{job.requirements}</Paragraph>
            </Card>
          )}

          {job.benefits && (
            <Card title="🎁 Quyền lợi" className="shadow-md">
              <Paragraph>{job.benefits}</Paragraph>
            </Card>
          )}

          <Card title="ℹ️ Thông tin công việc" className="shadow-md">
            <Descriptions column={1}>
              <Descriptions.Item label="Kinh nghiệm">
                {job.experience || "Không yêu cầu"}
              </Descriptions.Item>
              <Descriptions.Item label="Học vấn">
                {job.education || "Không yêu cầu"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngành nghề">
                {job.industry || "Không xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Giờ làm việc">
                {job.workingHours || "8 giờ/ngày"}
              </Descriptions.Item>
              {job.deadline && (
                <Descriptions.Item label="Hạn nộp hồ sơ">
                  {new Date(job.deadline).toLocaleDateString("vi-VN")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </div>

        {/* Apply Button */}
        <div className="text-center mt-8">
          <Button
            type="primary"
            size="large"
            className="bg-green-500 hover:bg-green-600"
            style={{ padding: "0 3rem" }}
          >
            🚀 Ứng tuyển ngay
          </Button>
        </div>

        {/* Posted Date */}
        <Paragraph className="text-center mt-6 text-gray-500">
          <small>Đăng ngày: {new Date(job.postedDate).toLocaleDateString("vi-VN")}</small>
        </Paragraph>
      </Card>
    </div>
  );
};

export default JobDetail;
