import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  User,
  Target,
  IdCard,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  ClipboardList,
  Search,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import {
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Progress,
  Spin,
  Alert,
} from "antd";

const { Title, Text, Paragraph } = Typography;

const JobSelector = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvRecommendations, setCvRecommendations] = useState([]);
  const navigate = useNavigate();

  const fetchAllJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/recommendation/jobs?limit=100");

      if (data.success) {
        setJobs(data.data.jobs);
        message.success("Đã tải danh sách công việc");
      } else {
        message.error("Lỗi khi tải danh sách công việc");
      }
    } catch (err) {
      message.error("Lỗi kết nối server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCVsForJob = async (jobId) => {
    setLoading(true);
    try {
      // Check model status
      const { data: statusResult } = await api.get("/recommendation/model-status");

      if (!statusResult.data.isModelBuilt) {
        const { data: buildResult } = await api.post("/recommendation/build-model");
        if (!buildResult.success) {
          message.error("Lỗi khi xây dựng mô hình");
          return;
        } else {
          message.success("Mô hình AI đã được xây dựng");
        }
      }

      const { data } = await api.get(`/recommendation/cvs-for-job/${jobId}?limit=10`);

      if (data.success) {
        setCvRecommendations(data.data.recommendations);
        setSelectedJob(jobs.find((job) => job.id === jobId));
        message.success("Đã tìm thấy các CV phù hợp");
      } else {
        message.error("Lỗi khi tìm CV phù hợp");
      }
    } catch (err) {
      message.error("Lỗi kết nối server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2} style={{ marginBottom: "16px" }}>
          <Space>
            <Briefcase style={{ color: "#1890ff" }} />
            Chọn Công Việc
          </Space>
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Chọn một công việc để xem danh sách CV phù hợp
        </Text>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text type="secondary">Đang tải...</Text>
          </div>
        </div>
      )}

      {!selectedJob ? (
        <div>
          <Title level={3} style={{ textAlign: "center", marginBottom: "24px" }}>
            <Space>
              <ClipboardList style={{ color: "#1890ff" }} />
              Danh sách công việc ({jobs.length})
            </Space>
          </Title>
          <Row gutter={[16, 16]}>
            {jobs.map((job, index) => (
              <Col xs={24} sm={12} lg={8} key={job.id || index}>
                <Card hoverable style={{ height: "100%" }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Title level={4} style={{ margin: 0, marginBottom: "8px" }}>
                        <Space>
                          <Briefcase style={{ color: "#1890ff" }} />
                          {job.title || "Chưa có tiêu đề"}
                        </Space>
                      </Title>
                      <Text strong style={{ color: "#1890ff" }}>
                        <Space>
                          <Building2 />
                          {job.company || "Chưa có công ty"}
                        </Space>
                      </Text>
                    </div>

                    <Space direction="vertical" size="small">
                      <Text>
                        <MapPin style={{ marginRight: "8px" }} />
                        <Text strong>Địa điểm:</Text> {job.location || "Chưa xác định"}
                      </Text>
                      <Text>
                        <DollarSign style={{ marginRight: "8px" }} />
                        <Text strong>Lương:</Text> {job.salaryRange || "Thương lượng"}
                      </Text>
                      <Text>
                        <Clock style={{ marginRight: "8px" }} />
                        <Text strong>Loại:</Text> {job.jobType || "Full-time"}
                      </Text>
                    </Space>

                    <div>
                      <Text strong style={{ display: "block", marginBottom: "8px" }}>
                        <Space>
                          <ClipboardList />
                          Mô tả:
                        </Space>
                      </Text>
                      <Paragraph
                        ellipsis={{ rows: 3, expandable: true }}
                        style={{ margin: 0 }}
                      >
                        {job.description || "Chưa có mô tả"}
                      </Paragraph>
                    </div>

                    <Space>
                      <Button
                        type="primary"
                        icon={<Users />}
                        onClick={() => getCVsForJob(job.id)}
                        disabled={loading}
                      >
                        Tìm CV phù hợp
                      </Button>
                      <Button
                        icon={<Search />}
                        onClick={() => navigate(`/job/${job.id}`)}
                      >
                        Chi tiết
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <div>
          <Card style={{ marginBottom: "32px" }}>
            <Title level={3} style={{ marginBottom: "16px" }}>
              <Space>
                <ClipboardList style={{ color: "#1890ff" }} />
                Công việc được chọn
              </Space>
            </Title>
            <Card
              style={{ backgroundColor: "#f0f8ff", marginBottom: "16px" }}
              bodyStyle={{ padding: "16px" }}
            >
              <Title level={4} style={{ margin: 0, marginBottom: "8px" }}>
                <Space>
                  <Briefcase style={{ color: "#1890ff" }} />
                  {selectedJob.title}
                </Space>
              </Title>
              <Space direction="vertical" size="small">
                <Text>
                  <Building2 style={{ marginRight: "8px" }} />
                  <Text strong>Công ty:</Text> {selectedJob.company}
                </Text>
                <Text>
                  <MapPin style={{ marginRight: "8px" }} />
                  <Text strong>Địa điểm:</Text> {selectedJob.location}
                </Text>
              </Space>
            </Card>
            <Button
              icon={<ArrowLeft />}
              onClick={() => {
                setSelectedJob(null);
                setCvRecommendations([]);
              }}
            >
              Chọn công việc khác
            </Button>
          </Card>

          <div>
            <Title level={3} style={{ textAlign: "center", marginBottom: "24px" }}>
              <Space>
                <Users style={{ color: "#1890ff" }} />
                CV phù hợp ({cvRecommendations.length})
              </Space>
            </Title>
            {cvRecommendations.length > 0 ? (
              <Row gutter={[16, 16]}>
                {cvRecommendations.map((recommendation, index) => (
                  <Col xs={24} sm={12} lg={8} key={recommendation.cvId || index}>
                    <Card hoverable style={{ height: "100%" }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Title level={5} style={{ margin: 0, flex: 1 }}>
                            <Space>
                              <User style={{ color: "#1890ff" }} />
                              {recommendation.cvOwner || "Chưa có tên"}
                            </Space>
                          </Title>
                          <Tag color="blue">
                            <Target style={{ marginRight: "4px" }} />
                            {(recommendation.score * 100).toFixed(1)}%
                          </Tag>
                        </div>
                        <Space direction="vertical" size="small">
                          <Text>
                            <IdCard style={{ marginRight: "8px" }} />
                            <Text strong>CV ID:</Text> {recommendation.cvId}
                          </Text>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                              <Text type="secondary">
                                <Target style={{ marginRight: "4px" }} />
                                Độ phù hợp:
                              </Text>
                              <Text type="secondary">{(recommendation.score * 100).toFixed(1)}%</Text>
                            </div>
                            <Progress
                              percent={recommendation.score * 100}
                              strokeColor={{
                                "0%": "#108ee9",
                                "100%": "#87d068",
                              }}
                              showInfo={false}
                            />
                          </div>
                        </Space>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{ textAlign: "center" }}>
                <Card>
                  <Space direction="vertical" size="large">
                    <XCircle style={{ fontSize: "32px", color: "#d9d9d9" }} />
                    <Text type="secondary" style={{ fontSize: "16px" }}>
                      Không tìm thấy CV phù hợp
                    </Text>
                  </Space>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSelector;
