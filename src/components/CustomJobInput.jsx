import React, { useState } from "react";
import {
  Briefcase,
  Loader2,
  Users,
  User,
  Target,
  IdCard,
  Search,
} from "lucide-react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Progress,
  message,
} from "antd";
import api from "../config/axios";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CustomJobInput = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cvRecommendations, setCvRecommendations] = useState([]);
  const [form] = Form.useForm();

  const MESSAGE_KEY = "status";

  const convertFormToJobData = (values) => ({
    title: values.title,
    company: values.company,
    location: values.location,
    jobType: values.jobType,
    salaryRange: values.salaryRange,
    experience: values.experience,
    education: values.education,
    description: values.description,
    requirements: values.requirements,
    benefits: values.benefits,
    skills: values.skills
      ? values.skills.split(",").map((s) => s.trim())
      : [],
    industry: values.industry,
  });

  const submitJobData = async (values) => {
    setIsLoading(true);
    setCvRecommendations([]);

    try {
      const jobData = convertFormToJobData(values);

      message.loading({ content: "Initializing the system...", key: MESSAGE_KEY });

      const statusRes = await api.get("/recommendation/model-status");
      const isBuilt = statusRes.data?.data?.isModelBuilt;

      if (!isBuilt) {
        message.loading({ content: "Building AI model...", key: MESSAGE_KEY });

        const buildRes = await api.post("/recommendation/build-model");

        if (!buildRes.data?.success) {
          message.error({ content: "Error occurred while building the model", key: MESSAGE_KEY });
          return;
        }
      }

      message.loading({ content: "Analyzing and matching CVs...", key: MESSAGE_KEY });

      const response = await api.post("/recommendation/cvs-for-custom-job?limit=20", jobData);
      const result = response.data;

      if (result.success) {
        setCvRecommendations(result.data.recommendations || []);
        message.success({
          content: `Found ${result.data.recommendations?.length || 0} matching CVs from ${result.data.totalCVsAnalyzed || 0} analyzed`,
          key: MESSAGE_KEY,
        });
      } else {
        message.error({ content: result.error || "Failed to retrieve recommended CVs", key: MESSAGE_KEY });
      }
    } catch (error) {
      console.error("Error:", error);
      message.error({ content: `Error: ${error.message}`, key: MESSAGE_KEY });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2}>
          <Space>
            <Briefcase style={{ color: "#1890ff" }} />
            Tìm CV cho Công việc
          </Space>
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          HR nhập thông tin công việc để tìm CV phù hợp nhất trong hệ thống
        </Text>
      </div>

      <Card style={{ marginBottom: "32px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={submitJobData}
          initialValues={{ jobType: "Full-time" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Tên công việc"
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tên công việc" }]}
              >
                <Input
                  placeholder="vd: Senior Frontend Developer"
                  prefix={<Briefcase style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Công ty" name="company">
                <Input placeholder="vd: Tech Company ABC" prefix={<Users style={{ color: "#bfbfbf" }} />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Địa điểm" name="location">
                <Input placeholder="vd: Hồ Chí Minh" prefix={<Target style={{ color: "#bfbfbf" }} />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Loại công việc" name="jobType">
                <Select>
                  <Option value="Full-time">Full-time</Option>
                  <Option value="Part-time">Part-time</Option>
                  <Option value="Contract">Contract</Option>
                  <Option value="Internship">Internship</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Mức lương" name="salaryRange">
                <Input placeholder="vd: 25-35 triệu VNĐ" prefix={<IdCard style={{ color: "#bfbfbf" }} />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Kinh nghiệm yêu cầu" name="experience">
                <Input placeholder="vd: 3+ năm kinh nghiệm" prefix={<Users style={{ color: "#bfbfbf" }} />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Kỹ năng yêu cầu (phân cách bằng dấu phẩy)"
                name="skills"
                rules={[{ required: true, message: "Vui lòng nhập ít nhất một kỹ năng" }]}
              >
                <Input placeholder="vd: JavaScript, React, Vue.js, HTML, CSS" prefix={<Target style={{ color: "#bfbfbf" }} />} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Ngành nghề" name="industry">
                <Input placeholder="vd: Information Technology" prefix={<Briefcase style={{ color: "#bfbfbf" }} />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả công việc" name="description">
            <TextArea rows={4} placeholder="Mô tả chi tiết về công việc..." />
          </Form.Item>

          <Form.Item
            label="Yêu cầu ứng viên"
            name="requirements"
            rules={[{ required: true, message: "Vui lòng nhập yêu cầu ứng viên" }]}
          >
            <TextArea rows={4} placeholder="Các yêu cầu cụ thể cho ứng viên..." />
          </Form.Item>

          <Form.Item label="Quyền lợi" name="benefits">
            <TextArea rows={3} placeholder="Các quyền lợi và phúc lợi cho nhân viên..." />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              icon={isLoading ? <Loader2 className="animate-spin" /> : <Search />}
              htmlType="submit"
              loading={isLoading}
              style={{ height: "48px", paddingLeft: "32px", paddingRight: "32px" }}
            >
              {isLoading ? "Đang xử lý..." : "Tìm CV phù hợp"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* CV Recommendations Results */}
      {cvRecommendations.length > 0 && (
        <div style={{ marginTop: "48px" }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: "24px" }}>
            <Space>
              <Users style={{ color: "#1890ff" }} />
              CV phù hợp được tìm thấy ({cvRecommendations.length})
            </Space>
          </Title>

          <Row gutter={[16, 16]}>
            {cvRecommendations.map((cv, index) => (
              <Col xs={24} sm={12} lg={8} key={cv.cvId || index}>
                <Card hoverable style={{ height: "100%" }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Title level={5} style={{ margin: 0, flex: 1 }}>
                        <Space>
                          <User style={{ color: "#1890ff" }} />
                          {cv.cvOwner || "Chưa có tên"}
                        </Space>
                      </Title>
                      <Space direction="vertical" size="small">
                        <Tag color="blue">
                          <Target style={{ marginRight: "4px" }} />
                          {(cv.score * 100).toFixed(1)}%
                        </Tag>
                        <Tag color="default">#{index + 1}</Tag>
                      </Space>
                    </div>

                    <Space direction="vertical" size="small">
                      <Text>
                        <IdCard style={{ marginRight: "8px" }} />
                        <Text strong>CV ID:</Text> {cv.cvId}
                      </Text>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <Text type="secondary">
                            <Target style={{ marginRight: "4px" }} />
                            Độ phù hợp:
                          </Text>
                          <Text type="secondary">{(cv.score * 100).toFixed(1)}%</Text>
                        </div>
                        <Progress
                          percent={cv.score * 100}
                          strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                          showInfo={false}
                        />
                      </div>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default CustomJobInput;
