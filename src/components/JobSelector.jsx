
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List, Card, Button, Spin, Typography, Alert } from "antd";
import "antd/dist/antd.css";

const { Title, Paragraph } = Typography;

const JobSelector = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvRecommendations, setCvRecommendations] = useState([]);
  const navigate = useNavigate();

  const fetchAllJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/recommendation/jobs?limit=100"
      );
      const data = await response.json();

      if (data.success) {
        setJobs(data.data.jobs);
      } else {
        console.error("Error fetching jobs:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const getCVsForJob = async (jobId) => {
    setLoading(true);
    try {
      const statusResponse = await fetch(
        "http://localhost:3000/api/v1/recommendation/model-status"
      );
      const statusResult = await statusResponse.json();

      if (!statusResult.data.isModelBuilt) {
        const buildResponse = await fetch(
          "http://localhost:3000/api/v1/recommendation/build-model",
          { method: "POST" }
        );

        if (!buildResponse.ok) {
          throw new Error("Không thể xây dựng mô hình AI");
        }

        const buildResult = await buildResponse.json();
        if (!buildResult.success) {
          throw new Error("Lỗi khi xây dựng mô hình");
        }
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/recommendation/cvs-for-job/${jobId}?limit=10`
      );
      const data = await response.json();

      if (data.success) {
        setCvRecommendations(data.data.recommendations);
        setSelectedJob(jobs.find((job) => job.id === jobId));
      } else {
        console.error("Error fetching CV recommendations:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <Title level={2} className="text-center mb-4">
          🏢 Chọn Công Việc
        </Title>
        <Paragraph className="text-center text-gray-600 mb-6">
          Chọn một công việc để xem danh sách CV phù hợp
        </Paragraph>

        {loading && (
          <div className="text-center">
            <Spin size="large" />
            <Paragraph className="mt-4">⏳ Đang tải...</Paragraph>
          </div>
        )}

        {!selectedJob ? (
          <div>
            <Title level={3} className="mb-4">
              📋 Danh sách công việc ({jobs.length})
            </Title>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={jobs}
              renderItem={(job, index) => (
                <List.Item>
                  <Card
                    title={job.title || "Chưa có tiêu đề"}
                    extra={<span className="text-gray-500">#{index + 1}</span>}
                    className="shadow-md"
                  >
                    <Paragraph>
                      <strong>🏢 Công ty:</strong> {job.company || "Chưa có công ty"}
                    </Paragraph>
                    <Paragraph>
                      <strong>📍 Địa điểm:</strong> {job.location || "Chưa xác định"}
                    </Paragraph>
                    <Paragraph>
                      <strong>💰 Lương:</strong> {job.salaryRange || "Thương lượng"}
                    </Paragraph>
                    <Paragraph>
                      <strong>⏰ Loại:</strong> {job.jobType || "Full-time"}
                    </Paragraph>
                    <Paragraph>
                      <strong>📝 Mô tả:</strong>
                      <br />
                      {job.description
                        ? job.description.length > 150
                          ? job.description.substring(0, 150) + "..."
                          : job.description
                        : "Chưa có mô tả"}
                    </Paragraph>
                    <div className="flex justify-between mt-4">
                      <Button
                        onClick={() => getCVsForJob(job.id)}
                        type="primary"
                        disabled={loading}
                      >
                        🎯 Tìm CV phù hợp
                      </Button>
                      <Button onClick={() => navigate(`/job/${job.id}`)}>
                        📄 Chi tiết
                      </Button>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <div>
            <Title level={3} className="mb-4">
              📋 Công việc được chọn
            </Title>
            <Card className="shadow-md mb-6">
              <Title level={4}>{selectedJob.title}</Title>
              <Paragraph>
                <strong>🏢 Công ty:</strong> {selectedJob.company}
              </Paragraph>
              <Paragraph>
                <strong>📍 Địa điểm:</strong> {selectedJob.location}
              </Paragraph>
              <Button
                onClick={() => {
                  setSelectedJob(null);
                  setCvRecommendations([]);
                }}
                className="bg-gray-200 hover:bg-gray-300"
              >
                ← Chọn công việc khác
              </Button>
            </Card>

            <Title level={3} className="mb-4">
              👥 CV phù hợp ({cvRecommendations.length})
            </Title>
            {cvRecommendations.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                dataSource={cvRecommendations}
                renderItem={(recommendation, index) => (
                  <List.Item>
                    <Card className="shadow-md">
                      <div className="flex justify-between items-center">
                        <Title level={4} className="m-0">
                          👤 {recommendation.cvOwner || "Chưa có tên"}
                        </Title>
                        <span className="text-green-500">
                          {(recommendation.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Paragraph>
                        <strong>🆔 CV ID:</strong> {recommendation.cvId}
                      </Paragraph>
                      <div className="bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${recommendation.score * 100}%` }}
                        ></div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Alert
                message="❌ Không tìm thấy CV phù hợp"
                type="info"
                showIcon
                className="max-w-md mx-auto"
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default JobSelector;
